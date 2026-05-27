# LocalAI TV — App Front-End

Single-file React front-end for the LocalAI TV app (hyperlocal Telugu news — Andhra Pradesh / Telangana).

## Files

| File | What it is |
|---|---|
| `App.jsx` | **Canonical source.** The entire app is one React file (~20,600 lines). Edit this. |
| `preview.html` | Runnable preview — `App.jsx` wrapped with React UMD + Babel-standalone (in-browser compile). Regenerated from `App.jsx` (see below). |
| `splash-intro.mp4` | Splash screen video used by the app. |
| `home-page-header-logo.mp4` | Home header logo video. |
| `latest-logo.mp4` | Logo video asset. |

> **Known gap:** `App.jsx` also references `wedding-banner.jpg`, which is **not** in this snapshot — supply it or confirm it is a remote asset.

## Run the preview locally

```bash
cd localaitv-app-repo
python3 -m http.server 8765
# open http://localhost:8765/preview.html
```

> First load takes **~15 seconds** — `preview.html` compiles ~1.4 MB of JSX in the browser via Babel-standalone. This is a **development preview**, not a production build. A production deployment requires a precompiled bundle (out of scope for this repo).

## Navigation

Boots: splash → intro → location picker (pick Kurnool) → Home. Bottom nav: Home · Live TV · Upload · Local · Profile.
- **Local → Kurnool pages** — the internal pages under active edit.
- **Profile → 🛡️ Admin Dashboard** — a visual demo (role switcher Super/Master/Admin, 15 modules, sample data, no backend). Under founder review.

## Regenerate `preview.html` after editing `App.jsx`

`preview.html` = the HTML wrapper + `App.jsx`, with two substitutions:

```python
import io
JSX="App.jsx"; PREV="preview.html"
IMP_OLD='import { useState, useEffect, useRef, useCallback, useMemo } from "react";'
IMP_NEW='const { useState, useEffect, useRef, useCallback, useMemo } = React;'
EXP_OLD='export default AppRoot;'
EXP_NEW='ReactDOM.createRoot(document.getElementById("root")).render(<AppRoot/>);'
prev=open(PREV,encoding="utf-8").read()
head=prev.split('<script type="text/babel">')[0] + '<script type="text/babel">\n'
src=open(JSX,encoding="utf-8").read().replace(IMP_OLD,IMP_NEW,1).rstrip()
src=src[:-len(EXP_OLD)].rstrip()+'\n\n'+EXP_NEW
open(PREV,"w",encoding="utf-8").write(head+src+'\n</script>\n</body>\n</html>\n')
```

## Architecture notes

- One-file React (no build step for the preview). State-machine routing via a `screen` string + `navigate()`. Dual light/dark theme (`useAppTheme()` / module-level `T`).
- The broader product ships as a **Capacitor mobile app** (iOS App Store + Android Play Store). This repo is the front-end source only.
- Private repo — add teammates via GitHub → Settings → Collaborators.
