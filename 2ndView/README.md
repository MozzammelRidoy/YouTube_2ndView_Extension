<p align="center">
  <img src="icon128.png" width="96" height="96" alt="2ndView logo">
</p>

<h1 align="center">2ndView</h1>

<p align="center">
  <b>Watch any YouTube video in a clean, distraction-free overlay — no sidebar, no recommendations, no comments.</b>
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

> This is the extension folder itself — load **this** folder (not the repo root) as an unpacked extension.
> For the full project overview, architecture, and the companion `2ndview-host` site, see the
> [root README](../README.md).

---

## What This Folder Is

`2ndView/` is a complete, self-contained Chrome extension (Manifest V3). When you open a YouTube video, it pauses
YouTube's native player and pops up a separate, full-screen overlay player on top of the page — distraction-free,
with keyboard controls and a resizable window. Press `Esc` and you're back exactly where you were.

---

## Features

| Feature                 | Description                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| Overlay player           | A second, independent video player floats above the YouTube page — no sidebar, no comments.    |
| Auto-open                | Opens by itself whenever a video plays (toggle-able).                                           |
| Timestamp sync           | Starts from the exact second the native player was at.                                          |
| Resizable                | Drag the slider, click the track, or use +/− buttons — 10% to 90% of screen width, remembered.  |
| Reload restore           | Optionally reopens the same video after you refresh the page.                                   |
| Right-click → Open       | Right-click any YouTube link to open it directly in the overlay.                                |
| Keyboard control         | Play/pause, seek, volume, mute — all from the keyboard, no mouse needed.                        |
| Global shortcut          | `Alt+2` opens the overlay for the current video from anywhere on a YouTube tab.                 |
| Shorts excluded          | YouTube Shorts pages are skipped automatically.                                                  |

---

## How to Download & Install (Developer Mode)

### Step 1 — Get the files

Clone or download the [repository](https://github.com/MozzammelRidoy/YouTube_2ndView_Extension). You only need this
`2ndView` folder:

```
2ndView/        ← this is the folder you load into Chrome
```

If you downloaded a ZIP, extract it first. Make sure the folder you select in the next steps contains
`manifest.json` directly inside it (not nested one level deeper).

### Step 2 — Open Chrome's extensions page

```
chrome://extensions
```

### Step 3 — Enable Developer Mode

Toggle **Developer mode** on, top-right corner. Three new buttons appear: **Load unpacked**, Pack extension,
Update.

### Step 4 — Load the extension

Click **Load unpacked** → select this `2ndView` folder.

### Step 5 — Done

2ndView appears in your extensions list and in the toolbar (pin it via the puzzle-piece icon if it's hidden).
Open any YouTube video — it activates automatically.

### Step 6 — Confirm the keyboard shortcut

```
chrome://extensions/shortcuts
```

Find **2ndView** and confirm `Alt+2` is set. If another extension already uses it, reassign it here.

---

## Reload After Code Changes

If you edit any file in this folder:

1. Go to `chrome://extensions`
2. Find 2ndView → click the reload icon (circular arrow)
3. Refresh any open YouTube tab

---

## Usage

### Automatic

Browse YouTube normally — the overlay opens itself when a video plays, as long as **"Open every video"** is on
in the popup settings.

### Manual

- Click the **2ndView toolbar icon** → **"Watch in 2ndView"**.
- Press **`Alt+2`** from anywhere on YouTube.
- **Right-click** any YouTube video link → **"Open in 2ndView"**.

### Controls inside the overlay

| Key            | Action            |
| -------------- | ------------------ |
| `Esc`          | Close overlay      |
| `Space` / `K`  | Play / Pause       |
| `←` / `→`      | Seek ±5 seconds    |
| `↑` / `↓`      | Volume ±10%        |
| `M`            | Mute / Unmute      |

Shortcuts are ignored while you're typing in a text box, so searching or commenting is never interrupted.

**Resize:** drag the vertical slider on the left of the video, click the track to jump to a size, or use the
small +/− buttons for 5% steps. Your chosen size is remembered for next time.

**Close:** press `Esc`, click outside the video, or click **"Close 2ndView"** in the popup.

---

## Settings (Popup)

Click the toolbar icon to open the popup.

| Setting                   | Storage key     | Default | What it does                                                            |
| --------------------------- | ----------------- | ------- | -------------------------------------------------------------------------- |
| **Enable 2ndView**         | `modalEnabled`    | On      | Master switch — turns the whole extension on or off.                    |
| **Open every video**       | `autoOpen`        | On      | Auto-opens the overlay whenever you navigate to a video.                 |
| **Keep open on refresh**   | `reloadRestore`   | Off     | Restores the overlay for the same video after you refresh the page.     |

All settings are stored locally via `chrome.storage.local` and take effect immediately — no reload required for
toggle changes.

---

## How It Works (Short Version)

- `content.js` watches YouTube's single-page navigation (it never does a full page reload between videos) and,
  on each new video, builds the overlay and points its `<iframe>` at a small hosted page
  (`https://2ndview-host.vercel.app/play.html?v=<id>&t=<seconds>`) that loads YouTube's own
  [IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) for that video.
- Keyboard shortcuts inside the overlay are sent into that iframe via `window.postMessage`, since the extension
  can't reach across origins directly.
- `background.js` wires up the right-click context-menu item and the `Alt+2` global shortcut.
- Only `activeTab`, `contextMenus`, and `storage` permissions are used — no network interception, no data leaves
  your browser.

See the [root README's technical overview](../README.md#how-it-works-technical-overview) for the full breakdown,
including the `2ndview-host` static site this folder depends on.

---

## Known Limitations

- **Not a network-level ad blocker** — it swaps the player, it doesn't block ad requests.
- **YouTube Shorts are intentionally unsupported.**
- **Needs `2ndview-host.vercel.app` to be reachable** — that's where the overlay's actual video player is hosted.
- **Keyboard shortcuts require focus outside a text input.**
- Must be reloaded from `chrome://extensions` after any file changes here.

---

## License

Released under the [MIT License](../LICENSE) — free to use, modify, and distribute.

## Author

**Mozzammel Ridoy**
GitHub: [@MozzammelRidoy](https://github.com/MozzammelRidoy) · Email: [dev.mozzammelridoy@gmail.com](mailto:dev.mozzammelridoy@gmail.com)
