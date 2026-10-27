# Speakwell – English speaking & writing coach

A phone-first web app (PWA). Works offline after the first visit. AI features use your own OpenAI key.

## Put it online (GitHub Pages, phone only)
1. On GitHub, create a new public repository, e.g. `speakwell`.
2. Tap **Add file → Upload files** and upload every file from this folder (not the folder itself).
3. Go to **Settings → Pages**, set Source to **Deploy from a branch**, branch **main**, folder **/ (root)**, Save.
4. After about a minute, open `https://<your-username>.github.io/speakwell/` in Chrome.
5. Chrome menu (⋮) → **Add to Home screen** → Install. It now opens like an app and works offline.

## Turn on the AI coach
Open the app → Settings (gear) → paste your OpenAI API key → type the model ID exactly as your OpenAI account lists it → **Test connection**.

## Updating later
Upload the changed files to the same repo. If the app looks old, open it once while online and reload.
In `sw.js`, raise the cache name (speakwell-v1 → v2) whenever you upload changes.
