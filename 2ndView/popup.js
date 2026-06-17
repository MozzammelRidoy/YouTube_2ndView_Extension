(async () => {
  const notice           = document.getElementById("notice");
  const actionBtn        = document.getElementById("actionBtn");
  const closeModalBtn    = document.getElementById("closeModalBtn");
  const modalToggle      = document.getElementById("modalEnabled");
  const autoOpenToggle   = document.getElementById("autoOpen");
  const reloadRestToggle = document.getElementById("reloadRestore");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabUrl = tab.url || "";

  const isYoutube = tabUrl.includes("youtube.com");
  const tabIsShorts = /youtube\.com\/shorts\//.test(tabUrl);
  const tabVideoId = (() => {
    const m = tabUrl.match(/[?&]v=([\w-]{11})/);
    return m ? m[1] : null;
  })();

  // Load settings
  const stored = await chrome.storage.local.get(["autoOpen", "modalEnabled", "reloadRestore"]);
  modalToggle.checked      = stored.modalEnabled !== false;
  autoOpenToggle.checked   = stored.autoOpen !== false;
  reloadRestToggle.checked = stored.reloadRestore === true;

  modalToggle.addEventListener("change", () => {
    chrome.storage.local.set({ modalEnabled: modalToggle.checked });
    refreshBtn();
  });
  autoOpenToggle.addEventListener("change", () => {
    chrome.storage.local.set({ autoOpen: autoOpenToggle.checked });
  });
  reloadRestToggle.addEventListener("change", () => {
    chrome.storage.local.set({ reloadRestore: reloadRestToggle.checked });
  });

  if (!isYoutube) {
    notice.style.display = "block";
    notice.textContent = "Open a YouTube video to use EmbedPlay.";
    return;
  }

  if (tabIsShorts) {
    notice.style.display = "block";
    notice.textContent = "Shorts not supported.";
    return;
  }

  if (!tabVideoId) {
    notice.style.display = "block";
    notice.textContent = "No video detected.";
    return;
  }

  // Try to get richer info (modal state) from content script — non-blocking
  let modalOpen = false;
  try {
    const info = await chrome.tabs.sendMessage(tab.id, { type: "GET_VIDEO_INFO" });
    if (info) modalOpen = !!info.modalOpen;
  } catch {}

  // Show close button only when modal is active
  if (modalOpen) {
    closeModalBtn.style.display = "flex";
    closeModalBtn.addEventListener("click", async () => {
      try { await chrome.tabs.sendMessage(tab.id, { type: "CLOSE_MODAL" }); } catch {}
      window.close();
    });
  }

  const refreshBtn = () => {
    if (!modalToggle.checked) { actionBtn.style.display = "none"; return; }
    actionBtn.style.display = "flex";
    actionBtn.innerHTML = "<span>▶</span> Watch in 2ndView";
    actionBtn.onclick = async () => {
      try { await chrome.tabs.sendMessage(tab.id, { type: "OPEN_EMBED" }); window.close(); }
      catch { actionBtn.textContent = "Error — reload the tab"; }
    };
  };

  refreshBtn();
})();
