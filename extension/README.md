# ApeAcademy Chrome Extension

Submit assignments to ApeAcademy directly from any webpage.

## Setup

### 1. Configure the Supabase key

Open `popup.js` and replace `YOUR_SUPABASE_ANON_KEY_HERE` with the value of
`VITE_SUPABASE_ANON_KEY` from `app/.env`.

```js
const SUPABASE_ANON_KEY = 'eyJ...'; // paste your anon key here
```

### 2. Add icons (optional)

Place 16×16, 48×48, and 128×128 PNG icon files in the extension folder:
- `icon16.png`
- `icon48.png`
- `icon128.png`

You can use any 🦍 / green logo. Without these files the extension will still
load but show a default icon.

### 3. Load in Chrome

1. Open **chrome://extensions**
2. Enable **Developer Mode** (toggle top-right)
3. Click **Load unpacked**
4. Select the **`extension/`** folder from this repository

The 🦍 ApeAcademy icon will appear in your browser toolbar.

## Usage

- **Popup:** Click the toolbar icon. Sign in with your ApeAcademy credentials,
  paste (or select on the page) your assignment text, pick a type, and submit.
- **Context menu:** Select any text on a webpage → right-click →
  *Submit to ApeAcademy* — the popup opens pre-filled with your selection.

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Chrome Extension Manifest V3 config |
| `popup.html` | Extension popup UI |
| `popup.js` | Popup logic — auth, submit, result |
| `content.js` | Injected into pages — returns selected text |
| `background.js` | Service worker — creates context menu |

## Publishing

To publish to the Chrome Web Store:
1. Zip the `extension/` folder contents (not the folder itself)
2. Upload to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
