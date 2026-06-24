<p align="center">
  <img src="2ndView/icon128.png" width="96" height="96" alt="2ndView logo">
</p>

<h1 align="center">2ndView</h1>

<p align="center">
  <b>An open-source, ads-free YouTube video player — watch any YouTube video without ads, in a clean,
  distraction-free overlay right on top of the YouTube page.</b>
</p>

<p align="center">
  youtube ads-free video player · ads bypass youtube player · watch youtube without ads · youtube ad-free overlay ·
  distraction-free youtube player · youtube popup player chrome extension
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-brightgreen?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Platform-Chrome-FF0033?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version 1.0.0">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License">
</p>

<p align="center">
  Author: <b>Mozzammel Ridoy</b> (<a href="https://github.com/MozzammelRidoy">@MozzammelRidoy</a>) · Free & Open Source
</p>

<p align="center">
  <a href="https://github.com/MozzammelRidoy"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
  <a href="https://linkedin.com/in/MozzammelRidoy"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="https://youtube.com/@MozzammelRidoy"><img src="https://img.shields.io/badge/YouTube-FF0000?style=flat-square&logo=youtube&logoColor=white" alt="YouTube"></a>
  <a href="https://facebook.com/MozzammelRidoyAR"><img src="https://img.shields.io/badge/Facebook-1877F2?style=flat-square&logo=facebook&logoColor=white" alt="Facebook"></a>
  <a href="mailto:dev.mozzammelridoy@gmail.com"><img src="https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>
  <a href="https://wa.me/8801889816198"><img src="https://img.shields.io/badge/WhatsApp-25D366?style=flat-square&logo=whatsapp&logoColor=white" alt="WhatsApp"></a>
</p>

---

> ⭐ **If you find this useful, [star the repo](https://github.com/MozzammelRidoy/YouTube_2ndView_Extension) and
> [follow @MozzammelRidoy](https://github.com/MozzammelRidoy) on GitHub** — fixes and new features get posted there first.

---

## Table of Contents

- [What is this?](#what-is-this)
- [Core Features](#core-features)
- [Repository Layout](#repository-layout)
- [How It Works (Technical Overview)](#how-it-works-technical-overview)
- [Settings Reference](#settings-reference)
- [Installation (Chrome Developer Mode)](#installation-chrome-developer-mode)
- [Usage](#usage)
- [Troubleshooting / FAQ](#troubleshooting--faq)
- [Known Limitations](#known-limitations)
- [Privacy](#privacy)
- [Contributing](#contributing)
- [License](#license)
- [Connect](#connect)

---

## What is this?

**2ndView** is a free, open-source **ads-free YouTube video player** — an ads-bypass overlay player for
watching YouTube videos without ads. When you open a YouTube video, it pauses YouTube's own player and pops up a
separate, self-contained video player in a full-screen overlay on top of the page — no ads, no sidebar, no
recommendations, no comments, no autoplay queue. Press `Esc` and you're back exactly where you were.

This repo contains two parts that work together:

1. **`2ndView/`** — the actual Chrome extension (Manifest V3) you load into your browser.
2. **`2ndview-host/`** — a tiny static site (deployed on Vercel) that the extension's overlay loads in an
   `<iframe>`. It exists purely because a `world: "MAIN"`/cross-origin embed needs a page to embed — see
   [How It Works](#how-it-works-technical-overview) for why.

> ⚠️ **Honest note on ads:** 2ndView does not block any network requests — it has no `declarativeNetRequest`
> rules and no ad-blocking logic. It works by swapping YouTube's native watch-page player for YouTube's own
> [IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) embed, which historically
> serves few or no ads compared to the native watch page. That has been reliably true for a long time, but it's
> YouTube's behavior, not a guarantee this project controls — see [Known Limitations](#known-limitations).

---

## Core Features

| Feature                     | Description                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 🎬 Overlay player            | Opens the video in a separate IFrame Player API instance, floating above the YouTube page.                    |
| ⏱️ Timestamp sync            | Starts the overlay from the exact second the native player was at when you triggered it.                      |
| 🖱️ Auto-open                 | Detects every video navigation (including YouTube's SPA routing) and opens automatically.                     |
| 🔁 Reload restore            | Optionally reopens the same video overlay after you refresh the page.                                          |
| 📏 Resizable                 | Drag the vertical slider (or use the +/− buttons) to resize 10%–90% of viewport width; size is remembered.    |
| 🖱️ Right-click → Open        | Right-click any `youtube.com` or `youtu.be` link and open it directly in the overlay, without navigating.      |
| ⌨️ Full keyboard control     | Play/pause, seek, volume, and mute — all relayed into the embedded player via `postMessage`.                   |
| ⌨️ Global shortcut           | `Alt+2` opens 2ndView for the current video from anywhere on a YouTube tab.                                    |
| 🚫 Shorts excluded           | YouTube Shorts pages are skipped automatically — there's nothing to "de-clutter" there.                        |
| 🔒 Local-only settings       | All toggles and the saved overlay size live in `chrome.storage.local`. Nothing is sent anywhere.               |

---

## Repository Layout

```
2ndView_Extension/
├── 2ndView/                  # The Chrome extension itself — this is the folder you load unpacked
│   ├── manifest.json         # MV3 manifest: permissions, content script, popup, shortcut
│   ├── background.js         # Service worker — context menu + Alt+2 command relay
│   ├── content.js            # Runs on youtube.com — builds/controls the overlay, watches navigation
│   ├── popup.html            # Toolbar popup markup
│   ├── popup.js               # Popup logic — settings toggles, "Watch in 2ndView" action button
│   ├── icon16.png / icon32.png / icon48.png / icon128.png
│   └── README.md             # Step-by-step install guide for this folder
├── 2ndview-host/             # Static site deployed to Vercel as 2ndview-host.vercel.app
│   ├── index.html            # Landing stub (not used by the extension)
│   └── play.html             # The actual host page — boots the YouTube IFrame Player API
├── LICENSE                   # MIT license
└── README.md                 # This file
```

---

## How It Works (Technical Overview)

YouTube's watch page can't be "cleaned up" in place without fighting its own scripts on every navigation, so
2ndView sidesteps the native player entirely and gives you a fresh one instead.

**1. `2ndView/content.js`** (runs on every `*://*.youtube.com/*` page)

- Watches for navigation using `yt-navigate-finish`, `yt-page-data-updated`, and a `MutationObserver` on
  `document.body` — YouTube is a single-page app, so a normal page-load listener would miss most navigations.
- On each new watch page, extracts the 11-character video ID from the URL, reads the native player's current
  time, **pauses the native `<video>` element**, and builds a full-screen overlay (`position: fixed`,
  `z-index: 2147483647`) containing an `<iframe>` pointed at
  `https://2ndview-host.vercel.app/play.html?v=<id>&t=<seconds>`.
- The overlay also renders the resize slider (drag, click-to-jump, or +/− 5% step buttons) and the close button,
  and listens for `Escape` / `Space` / `K` / arrow keys / `M` while it's open — these are translated into typed
  `postMessage` commands and sent to the iframe.
- A right-click on any YouTube link, or the `Alt+2` shortcut, both arrive here as `chrome.runtime` messages
  from `background.js` and trigger the same `openEmbedModal()` path.

**2. `2ndview-host/play.html`** (static page, deployed separately on Vercel)

- A minimal page whose only job is to load the official `https://www.youtube.com/iframe_api` script and
  construct a `YT.Player` for the requested video ID/start time, with `rel=0` and `modestbranding=1`.
- Listens for `window.postMessage({ type: "2ndview-ctrl", action })` from the extension and maps `action` to the
  matching `YT.Player` call (`playVideo`/`pauseVideo`, `seekTo`, `setVolume`/`mute`/`unMute`).
- Runs on its own origin (`2ndview-host.vercel.app`) because the extension's content script lives in
  `youtube.com`'s context and cannot directly call into a separately-loaded `YT.Player` instance running in a
  cross-origin iframe — `postMessage` is the only channel between them, which is also why every message is
  origin-checked on both ends.

**3. `2ndView/background.js`** (service worker)

- Registers the **"Open in 2ndView"** context-menu item (visible on `youtube.com`/`youtu.be` links) and forwards
  clicks to the content script as `OPEN_EMBED_URL`.
- Listens for the `Alt+2` command and forwards it as `OPEN_EMBED` to the active tab's content script.

**4. `2ndView/popup.js`** (toolbar popup)

- Reads the active tab's URL to detect whether you're on a playable YouTube video (and shows a notice if you're
  not, or if it's a Shorts page).
- Asks the content script for live state (`GET_VIDEO_INFO`) to decide whether to show a **"Close 2ndView"**
  button in addition to the **"Watch in 2ndView"** action button.
- Reads/writes the three settings toggles directly to `chrome.storage.local`.

**Permissions used:** `activeTab`, `contextMenus`, `storage` only. No broad `tabs` permission, no host network
permissions, no `declarativeNetRequest` — nothing is intercepted at the network level, and nothing leaves your
browser except the two HTTPS requests YouTube's own embed already needs (`youtube.com/iframe_api` and the video
itself).

---

## Settings Reference

All settings live in `chrome.storage.local` and apply live via `chrome.storage.onChanged` — no reload needed for
toggle changes.

| Setting                  | Storage key     | Default | What it actually does                                                                                          |
| ------------------------- | ---------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| Enable 2ndView           | `modalEnabled`   | `true`  | Master switch. When off, no overlay opens automatically, the context-menu item and `Alt+2` no-op, and the popup's action button hides. |
| Open every video          | `autoOpen`       | `true`  | When on, the overlay opens by itself the moment a watch page finishes loading. When off, you trigger it manually (popup button, `Alt+2`, or right-click). |
| Keep open on refresh      | `reloadRestore`  | `false` | When on, refreshing a watch page that had the overlay open re-opens it for the same video automatically. When off, a refresh always starts with the overlay closed. |
| Overlay size              | `modalSize`      | `80`    | Viewport width percentage (10–90) of the overlay box; updated live as you drag the resize slider and remembered for the next video. |
| Last opened video (internal) | `lastModalVideo` | —    | Bookkeeping only — records which video ID was open so "Keep open on refresh" knows what to restore.             |

---

## Installation (Chrome Developer Mode)

2ndView is not on the Chrome Web Store — you load it yourself, straight from source. No build step needed.

1. **Clone or download** this repository:
   ```
   git clone https://github.com/MozzammelRidoy/YouTube_2ndView_Extension.git
   ```
2. Open Google Chrome and go to `chrome://extensions/`.
3. Toggle **Developer mode** on (top-right corner).
4. Click **Load unpacked** (top-left corner).
5. Select the **`2ndView`** folder (the one containing `manifest.json`) — not the repo root.
6. Pin the extension from the toolbar puzzle-piece icon for quick access.
7. Open `chrome://extensions/shortcuts` and confirm `Alt+2` is assigned to 2ndView (reassign it there if another
   extension already claims it).
8. Open or refresh any `youtube.com` tab — it's now active.

To update after pulling new changes: go back to `chrome://extensions/`, click the reload icon on the extension's
card, then refresh any open YouTube tabs.

> For a more detailed walkthrough with screenshots-free step-by-step instructions, see
> [`2ndView/README.md`](2ndView/README.md).

---

## Usage

### Automatic

Just browse YouTube as normal — with "Open every video" enabled, the overlay opens itself on every video
navigation.

### Manual

- Click the toolbar icon → **"Watch in 2ndView"**.
- Press **`Alt+2`** from any YouTube tab.
- **Right-click** any YouTube video link → **"Open in 2ndView"**.

### Inside the overlay

| Key            | Action            |
| -------------- | ------------------ |
| `Esc`          | Close overlay      |
| `Space` / `K`  | Play / Pause       |
| `←` / `→`      | Seek ±5 seconds    |
| `↑` / `↓`      | Volume ±10%        |
| `M`            | Mute / Unmute      |

Shortcuts are ignored while focus is inside a text input, textarea, or editable element, so typing a comment or
search query is never hijacked.

**Resize:** drag the vertical slider on the left of the player, click anywhere on the track to jump, or use the
small +/− buttons for 5% steps.

---

## Troubleshooting / FAQ

**The overlay didn't open right after I installed the extension.**
Settings load from `chrome.storage` asynchronously on first run, and auto-open is intentionally gated until that
finishes (to avoid firing with the wrong defaults). Refresh the tab once after installing.

**`Alt+2` doesn't do anything.**
Another extension or Chrome itself may already own that shortcut. Check `chrome://extensions/shortcuts` and
reassign it if needed.

**The overlay opens but the video never loads (stays black).**
The overlay's `<iframe>` loads `2ndview-host.vercel.app`, which in turn loads `youtube.com/iframe_api`. If either
is blocked by your network/firewall/DNS, the player can't initialize. Open DevTools (F12) on the YouTube tab and
check the console/network tab for blocked requests.

**Closing the overlay didn't resume the native player.**
That's expected — the native `<video>` is deliberately paused the moment the overlay opens, since you're now
watching a second, independent player instance. Press play on the native player if you want to go back to it.

**Does this work on YouTube Shorts?**
No, by design — Shorts pages are detected and skipped entirely.

---

## Known Limitations

- **Not a network-level ad blocker.** No `declarativeNetRequest` rules, no request interception. It works by
  giving you a different player, not by blocking ad requests.
- **Depends on YouTube's IFrame Player API behavior.** Fewer/no ads in embeds has held true for a long time, but
  YouTube controls that behavior, not this project — it could change without notice.
- **Depends on a third-party host.** The overlay's video player is loaded from `2ndview-host.vercel.app`; if that
  deployment is down or unreachable, the overlay can't load a video. Self-hosting `2ndview-host/play.html`
  elsewhere and pointing `content.js` at it is a straightforward fork if you need full independence.
- **YouTube Shorts are intentionally unsupported.**
- **Chrome / Manifest V3 only.** Not packaged for Firefox or any Chromium-based store besides loading it
  manually.

---

## Privacy

- No user data is collected, logged, or transmitted anywhere by this project.
- Settings and overlay size are stored only in `chrome.storage.local`, on your machine.
- The only network requests made are the ones YouTube's own embed already requires to play a video.

---

## Contributing

This is a free, open-source project. Issues and pull requests are welcome — fork the repo, make your changes, and
open a PR. If you change `2ndview-host/play.html`'s message contract or `content.js`'s `postMessage` calls, please
keep both sides in sync since they're the only channel connecting the two halves of this project.

## License

Released under the [MIT License](LICENSE) — free to use, modify, and distribute.

## Connect

| Platform           | Link                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| ⭐ Star this repo   | [github.com/MozzammelRidoy/YouTube_2ndView_Extension](https://github.com/MozzammelRidoy/YouTube_2ndView_Extension) |
| 🐙 GitHub (follow)  | [github.com/MozzammelRidoy](https://github.com/MozzammelRidoy)                                                 |
| 💼 LinkedIn         | [linkedin.com/in/MozzammelRidoy](https://linkedin.com/in/MozzammelRidoy)                                       |
| ▶️ YouTube          | [youtube.com/@MozzammelRidoy](https://youtube.com/@MozzammelRidoy)                                             |
| 📘 Facebook         | [facebook.com/MozzammelRidoyAR](https://facebook.com/MozzammelRidoyAR)                                         |
| 📧 Email            | [dev.mozzammelridoy@gmail.com](mailto:dev.mozzammelridoy@gmail.com)                                            |
| 💬 WhatsApp         | [+880 1889-816198](https://wa.me/8801889816198)                                                                |

---

<sub>**Keywords:** youtube ad-free overlay, watch youtube without ads chrome extension, distraction-free youtube
player, youtube popup player, youtube embed overlay, no sidebar youtube, no recommendations youtube extension,
open source youtube extension, youtube iframe player overlay.</sub>
