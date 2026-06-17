// ── Helpers ───────────────────────────────────────────────────
function extractVideoId(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function isShorts(url) {
  return /youtube\.com\/shorts\//.test(url);
}

// ── State (defaults match original — works before storage loads) ──
let modalOpen        = false;
let lastVideoId      = null;
let currentSize      = 80;
let autoOpenEnabled  = true;
let modalEnabled     = true;
let reloadRestore    = false;
let storageReady     = false;   // gate: don't auto-trigger before settings are loaded
let embedIframe      = null;
let closeModalFn     = null;

const SLIDER_MIN = 10;
const SLIDER_MAX = 90;

// ── IFrame message bridge ─────────────────────────────────────
function sendToEmbed(action) {
  embedIframe?.contentWindow?.postMessage(
    { type: "2ndview-ctrl", action },
    "https://2ndview-host.vercel.app"
  );
}

// ── Modal ─────────────────────────────────────────────────────
function openEmbedModal(videoId, startTime = 0) {
  document.getElementById("embedplay-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "embedplay-overlay";
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:2147483647;
    background:rgba(10,10,10,0.95);backdrop-filter:blur(8px);
    display:flex;align-items:center;justify-content:center;
    font-family:"YouTube Sans",Roboto,Arial,sans-serif;
    opacity:0;transition:opacity 0.25s ease;
  `;

  // Wrapper — absolute-positioned children (slider, close) anchor here
  const boxWrapper = document.createElement("div");
  boxWrapper.style.cssText = `
    position:relative;
    width:${currentSize}vw;max-width:1200px;
    transform:scale(0.94);transition:transform 0.25s ease;
  `;

  // Video container
  const box = document.createElement("div");
  box.style.cssText = `
    width:100%;aspect-ratio:16/9;
    box-shadow:0 0 0 1px rgba(255,0,0,0.25),0 0 50px rgba(255,0,0,0.12),0 20px 60px rgba(0,0,0,0.8);
    border-radius:12px;
  `;

  const iframeUrl = new URL("https://2ndview-host.vercel.app/play.html");
  iframeUrl.searchParams.set("v", videoId);
  iframeUrl.searchParams.set("t", String(startTime));

  const iframe = document.createElement("iframe");
  iframe.src = iframeUrl.toString();
  iframe.title = "YouTube video player";
  iframe.style.cssText = "width:100%;height:100%;border:0;border-radius:12px;";
  iframe.allow = "accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share";
  iframe.allowFullscreen = true;
  embedIframe = iframe;
  box.appendChild(iframe);

  // ── Vertical size slider (left of box) ────────────────────
  const sliderCol = document.createElement("div");
  sliderCol.style.cssText = `
    position:absolute;right:calc(100% + 12px);top:0;bottom:0;
    width:26px;
    display:flex;flex-direction:column;align-items:center;gap:8px;
  `;

  const mkStepBtn = (char, label) => {
    const b = document.createElement("button");
    b.textContent = char;
    b.title = label;
    b.style.cssText = `
      width:22px;height:22px;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;
      background:rgba(255,255,255,0.04);
      border:1.5px solid rgba(255,255,255,0.12);
      border-radius:50%;cursor:pointer;
      color:rgba(255,255,255,0.55);
      font-size:15px;font-weight:700;line-height:1;
      transition:border-color 0.15s,background 0.15s,color 0.15s,transform 0.15s;
    `;
    b.addEventListener("mouseenter", () => {
      b.style.borderColor = "#ff0000"; b.style.background = "rgba(255,0,0,0.12)";
      b.style.color = "#ff0000"; b.style.transform = "scale(1.15)";
    });
    b.addEventListener("mouseleave", () => {
      b.style.borderColor = "rgba(255,255,255,0.12)"; b.style.background = "rgba(255,255,255,0.04)";
      b.style.color = "rgba(255,255,255,0.55)"; b.style.transform = "scale(1)";
    });
    return b;
  };

  const stepUp   = mkStepBtn("+", "Larger (+5%)");
  const stepDown = mkStepBtn("−", "Smaller (−5%)");

  const track = document.createElement("div");
  track.style.cssText = `
    flex:1;position:relative;width:4px;
    background:rgba(255,255,255,0.13);border-radius:4px;
    cursor:pointer;transition:width 0.12s;
  `;

  const sliderFill = document.createElement("div");
  sliderFill.style.cssText = `
    position:absolute;left:0;right:0;bottom:0;
    background:#ff0000;border-radius:4px;pointer-events:none;
  `;

  const sliderThumb = document.createElement("div");
  sliderThumb.style.cssText = `
    position:absolute;left:50%;width:14px;height:14px;
    background:#fff;border-radius:50%;
    transform:translateX(-50%) translateY(50%);
    box-shadow:0 1px 5px rgba(0,0,0,0.7);
    cursor:grab;pointer-events:all;
    transition:transform 0.12s,box-shadow 0.12s;
  `;

  const sizeLabel = document.createElement("span");
  sizeLabel.style.cssText = `
    font-size:9px;font-weight:700;
    color:rgba(255,255,255,0.22);
    letter-spacing:0.2px;flex-shrink:0;
  `;

  track.appendChild(sliderFill);
  track.appendChild(sliderThumb);
  sliderCol.appendChild(stepUp);
  sliderCol.appendChild(track);
  sliderCol.appendChild(stepDown);
  sliderCol.appendChild(sizeLabel);

  let isDragging = false;

  const sizeFromY = (clientY) => {
    const r = track.getBoundingClientRect();
    const pct = 1 - Math.max(0, Math.min(1, (clientY - r.top) / r.height));
    return Math.round(SLIDER_MIN + pct * (SLIDER_MAX - SLIDER_MIN));
  };

  const applySize = (sz, save) => {
    sz = Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, Math.round(sz)));
    currentSize = sz;
    const pct = (sz - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN);
    sliderFill.style.height = `${pct * 100}%`;
    sliderThumb.style.bottom = `calc(${pct * 100}% - 7px)`;
    sizeLabel.textContent = `${sz}%`;
    boxWrapper.style.width = `${sz}vw`;
    if (save) chrome.storage.local.set({ modalSize: sz });
  };

  track.addEventListener("mouseenter", () => { if (!isDragging) track.style.width = "6px"; });
  track.addEventListener("mouseleave", () => { if (!isDragging) track.style.width = "4px"; });

  sliderThumb.addEventListener("mouseenter", () => {
    if (isDragging) return;
    sliderThumb.style.transform = "translateX(-50%) translateY(50%) scale(1.28)";
    sliderThumb.style.boxShadow = "0 0 0 4px rgba(255,0,0,0.2),0 1px 5px rgba(0,0,0,0.7)";
  });
  sliderThumb.addEventListener("mouseleave", () => {
    if (isDragging) return;
    sliderThumb.style.transform = "translateX(-50%) translateY(50%) scale(1)";
    sliderThumb.style.boxShadow = "0 1px 5px rgba(0,0,0,0.7)";
  });

  sliderThumb.addEventListener("mousedown", (e) => {
    isDragging = true;
    e.preventDefault(); e.stopPropagation();
    sliderThumb.style.cursor = "grabbing";
    sliderThumb.style.transform = "translateX(-50%) translateY(50%) scale(1.4)";
    sliderThumb.style.boxShadow = "0 0 0 6px rgba(255,0,0,0.25),0 1px 5px rgba(0,0,0,0.7)";
    track.style.width = "6px";
    const onMove = (ev) => { ev.preventDefault(); applySize(sizeFromY(ev.clientY), false); };
    const onUp   = (ev) => {
      isDragging = false;
      sliderThumb.style.cursor = "grab";
      sliderThumb.style.transform = "translateX(-50%) translateY(50%) scale(1)";
      sliderThumb.style.boxShadow = "0 1px 5px rgba(0,0,0,0.7)";
      track.style.width = "4px";
      applySize(sizeFromY(ev.clientY), true);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  track.addEventListener("click", (e) => {
    if (e.target === sliderThumb) return;
    applySize(sizeFromY(e.clientY), true);
  });

  stepUp.addEventListener("click",   () => applySize(currentSize + 5, true));
  stepDown.addEventListener("click", () => applySize(currentSize - 5, true));

  applySize(currentSize, false);

  // ── Close button (right of box) ───────────────────────────
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  closeBtn.title = "Close (Esc)";
  closeBtn.style.cssText = `
    position:absolute;left:calc(100% + 8px);top:0;
    background:transparent;border:none;cursor:pointer;
    color:#ff0000;font-size:22px;font-weight:900;
    width:36px;height:36px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    text-shadow:0 0 12px rgba(255,0,0,0.8);
    transition:color 0.15s,background 0.15s,transform 0.18s,text-shadow 0.15s;
  `;
  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.color = "#fff"; closeBtn.style.background = "#ff0000";
    closeBtn.style.transform = "rotate(90deg) scale(1.1)"; closeBtn.style.textShadow = "none";
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.color = "#ff0000"; closeBtn.style.background = "transparent";
    closeBtn.style.transform = "rotate(0deg) scale(1)"; closeBtn.style.textShadow = "0 0 12px rgba(255,0,0,0.8)";
  });

  boxWrapper.appendChild(sliderCol);
  boxWrapper.appendChild(box);
  boxWrapper.appendChild(closeBtn);
  overlay.appendChild(boxWrapper);

  // ── Close logic + keyboard ────────────────────────────────
  const close = () => {
    overlay.remove();
    modalOpen    = false;
    embedIframe  = null;
    closeModalFn = null;
    document.removeEventListener("keydown", keyHandler, true);
    chrome.storage.local.remove("lastModalVideo");
  };
  closeModalFn = close;

  const keyHandler = (e) => {
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target.contentEditable === "true") return;
    if (e.key === "Escape") { e.stopPropagation(); close(); return; }
    const cmds = {
      Space: "toggle", KeyK: "toggle",
      ArrowRight: "seekForward", ArrowLeft: "seekBackward",
      ArrowUp: "volumeUp", ArrowDown: "volumeDown",
      KeyM: "mute",
    };
    const action = cmds[e.code];
    if (action) { e.preventDefault(); e.stopPropagation(); sendToEmbed(action); }
  };

  document.addEventListener("keydown", keyHandler, true);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    boxWrapper.style.transform = "scale(1)";
  });
  modalOpen = true;
  chrome.storage.local.set({ lastModalVideo: videoId });
}

// ── Trigger ───────────────────────────────────────────────────
function triggerOpen(videoId, video) {
  if (!modalEnabled) return;
  if (video) video.pause();
  openEmbedModal(videoId, video ? Math.floor(video.currentTime) : 0);
}

// ── Watch (mirrors original reliable pattern) ─────────────────
function watchVideo() {
  if (isShorts(location.href)) return;

  const video = document.querySelector("video.html5-main-video");
  if (!video) return;

  const videoId = extractVideoId(location.href);
  if (!videoId) return;

  if (modalOpen && !video.paused) video.pause();
  if (modalOpen && !document.getElementById("embedplay-overlay")) openEmbedModal(lastVideoId || videoId);

  if (videoId !== lastVideoId) {
    // Don't trigger until storage has loaded — prevents wrong defaults firing on startup
    if (storageReady) {
      lastVideoId = videoId;
      delete video.dataset.embedplayBound;
      if (autoOpenEnabled || modalOpen) triggerOpen(videoId, video);
    }
  }

  if (video.dataset.embedplayBound) return;
  video.dataset.embedplayBound = "true";
  video.addEventListener("play", () => { if (modalOpen) video.pause(); });
}

// ── Message handler ───────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "OPEN_EMBED") {
    if (!modalEnabled || isShorts(location.href)) return;
    const vid = extractVideoId(location.href);
    if (vid) triggerOpen(vid, document.querySelector("video.html5-main-video"));
  } else if (message.type === "OPEN_EMBED_URL") {
    if (!modalEnabled) return;
    const vid = extractVideoId(message.url);
    if (vid) openEmbedModal(vid, 0);
  } else if (message.type === "CLOSE_MODAL") {
    closeModalFn?.();
    sendResponse({ ok: true });
  } else if (message.type === "GET_VIDEO_INFO") {
    const shorts = isShorts(location.href);
    sendResponse({ videoId: shorts ? null : extractVideoId(location.href), isShorts: shorts, modalOpen });
  }
});

// React to storage changes instantly (no page reload needed)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.modalEnabled)  modalEnabled    = changes.modalEnabled.newValue !== false;
  if (changes.autoOpen)      autoOpenEnabled = changes.autoOpen.newValue !== false;
  if (changes.reloadRestore) reloadRestore   = changes.reloadRestore.newValue === true;
});

// ── Init — START IMMEDIATELY like original, load storage async ─
let rafScheduled = false;
function scheduleWatch() {
  if (rafScheduled) return;
  rafScheduled = true;
  requestAnimationFrame(() => { rafScheduled = false; watchVideo(); });
}

// Immediate start — don't wait for storage (original's reliable pattern)
watchVideo();

window.addEventListener("yt-navigate-finish", () => {
  // Reset lastVideoId when leaving a watch page so returning to same video still triggers
  if (!extractVideoId(location.href)) lastVideoId = null;
  scheduleWatch();
});

// yt-page-data-updated fires after YouTube finishes setting up the player —
// more reliable than yt-navigate-finish for history/playlist navigations
window.addEventListener("yt-page-data-updated", scheduleWatch);

new MutationObserver(scheduleWatch).observe(document.body, { childList: true, subtree: true });

// Load settings — then decide whether to auto-open, restore, or do nothing
chrome.storage.local.get(["autoOpen", "modalEnabled", "modalSize", "reloadRestore", "lastModalVideo"], (r) => {
  if (r.modalSize)                   currentSize     = Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, r.modalSize));
  if (r.autoOpen     !== undefined)  autoOpenEnabled = r.autoOpen !== false;
  if (r.modalEnabled !== undefined)  modalEnabled    = r.modalEnabled !== false;
  if (r.reloadRestore !== undefined) reloadRestore   = r.reloadRestore === true;
  storageReady = true;

  const isReload = performance.getEntriesByType?.("navigation")?.[0]?.type === "reload";
  const vid      = extractVideoId(location.href);

  if (isReload && vid) {
    // ── Reload: controlled entirely by Restore on reload toggle ──
    lastVideoId = vid; // mark seen — blocks auto-open from firing
    if (reloadRestore && modalEnabled && r.lastModalVideo === vid) {
      openEmbedModal(vid, 0); // explicit restore
    }
    // reloadRestore OFF → modal stays closed regardless of autoOpen
  } else {
    // ── Normal load / SPA navigation ──
    watchVideo();
  }
});
