# 2ndView

> Watch YouTube videos without ads — clean overlay player, keyboard controls, auto-open.

---

## What it does

**2ndView** opens any YouTube video in a distraction-free fullscreen overlay directly on the YouTube page. The video plays without pre-roll or mid-roll ads, without the recommendation sidebar, and without comments. Close the overlay and you are right back where you were.

---

## How to Download & Install (Developer Mode)

### Step 1 — Download the files

Clone or download this repository to your computer. You only need the `2ndView` folder.

```
2ndView/        ← this is the folder you load into Chrome
```

If you received a ZIP file, extract it first. Make sure the folder contains `manifest.json` at the top level.

### Step 2 — Open Chrome Extensions

Open Google Chrome and go to:

```
chrome://extensions
```

### Step 3 — Enable Developer Mode

In the **top-right corner** of the extensions page, turn on the **Developer mode** toggle.

New buttons appear: **Load unpacked**, Pack extension, Update.

### Step 4 — Load the extension

Click **Load unpacked**.

In the file picker, navigate to and select the `2ndView` folder.

### Step 5 — Done

2ndView appears in your extensions list with the icon.  
The icon also appears in the Chrome toolbar (top-right). Pin it if needed.

Go to any YouTube video — 2ndView activates automatically.

### Confirm the keyboard shortcut

```
chrome://extensions/shortcuts
```

Find **2ndView** → confirm `Alt+2` is set. If another extension already uses it, reassign it here.

---

## Reload After Code Changes

Any time you edit the extension files:

1. Go to `chrome://extensions`
2. Find 2ndView
3. Click the **reload** icon (circular arrow)
4. Refresh the YouTube tab

---

## Usage

### Automatic

Navigate to any YouTube video — the overlay opens by itself (if "Open every video" is on in settings).

### Manual

- Click the **2ndView toolbar icon** → click **Watch in 2ndView**
- Or press `Alt + 2` from anywhere on YouTube
- Or right-click any YouTube video link → **"Open in 2ndView"**

### Controls inside the overlay

| Key | Action |
|---|---|
| `Esc` | Close overlay |
| `Space` / `K` | Play / Pause |
| `←` / `→` | Seek ±5 seconds |
| `↑` / `↓` | Volume ±10% |
| `M` | Mute / Unmute |

**Resize:** Drag the vertical slider on the left side of the video — up to enlarge, down to shrink.

**Close:** Press `Esc`, click the backdrop, or click "Close 2ndView" in the popup.

---

## Settings (Popup)

Click the toolbar icon to open the popup.

| Setting | Description |
|---|---|
| **Enable 2ndView** | Master switch — turn everything on or off |
| **Open every video** | Auto-open overlay whenever you navigate to a video |
| **Keep open on refresh** | Restore the overlay after refreshing the YouTube page |

---

## Features

- No pre-roll or mid-roll ads
- No sidebar, no recommendations, no comments
- Starts from the same timestamp as the original video
- Persistent size — remembers your last resize
- Playlist support — follows the playlist automatically
- YouTube Shorts are excluded automatically
- Works with YouTube history navigation (back/forward)

---

## Known Limitations

- YouTube only — no other platforms
- Keyboard shortcuts require focus outside a text input
- Extension must be reloaded (`chrome://extensions`) after file changes

---

## Author

**Mozzammel Ridoy**
GitHub: [@MozzammelRidoy](https://github.com/MozzammelRidoy)
