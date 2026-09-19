# Vighanharta Run

A Ganpati Chaturthi themed endless runner. HTML5 canvas + vanilla JS modules.

## How to run locally

The game uses ES modules (`import`/`export`), which **require a local HTTP server**. Opening `index.html` by double-clicking will show a blank page.

### Easiest — VS Code + Live Server (recommended)

1. Install [VS Code](https://code.visualstudio.com/) if you don't have it.
2. Open the project folder in VS Code: **File → Open Folder**.
3. Install the **Live Server** extension (Ctrl+Shift+X, search "Live Server", install).
4. Right-click `index.html` → **Open with Live Server**.
5. The game opens at `http://127.0.0.1:5500/`.

### Alternative — any static server

If you have Python installed:

```bash
# Python 3
python -m http.server 5500

# Python 2
python -m SimpleHTTPServer 5500
```

Then open `http://127.0.0.1:5500/` in a browser.

Node users can also use:

```bash
npx serve .
# or
npx http-server -p 5500
```

### Alternative — one file, no install

Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) and you're done. Nothing else needed.

## Project structure

```
VighnahartaRun2D/
├── index.html
├── css/style.css
├── assets/
│   ├── menu-bg.png
│   ├── instructions-mobile.png
│   └── sounds/
│       ├── music-menu.mp3
│       ├── aarti-bell.mp3
│       └── aarti-win.mp3
└── src/
    ├── main.js
    ├── draw.js
    ├── cloud.js
    ├── cheats.js
    ├── core/       (canvas, state, save, audio, input, loop, config)
    ├── data/       (scenes, outfits, difficulties)
    ├── ui/         (buttons, cards, registry, touchControls, virtualKeyboard)
    ├── screens/    (menu, intro, instructions, etc.)
    ├── world/      (background, pandal, props, particles, obstacles, coins)
    ├── player/     (draw, physics)
    └── gameplay/   (lightCycle, scoring, rounds, playing)
```

## Controls

- **A / ←** — run left
- **D / →** — run right
- **W / ↑ / Space** — jump
- **S / ↓** — crouch
- **Alt** — hold for aarti pose (during red light)
- **E** — pick up / offer modak
- **Esc / P** — pause
- **M** — mute

Mobile: on-screen touch buttons appear automatically.

## Cheat codes (type on keyboard anywhere in the game)

- `bappa` — jump to Round 5
- `pooja` — instant win + Pooja
- `laxmi` — +5000 coins
- `ganesh` — unlock all scenes (if wired)

## Cloud leaderboard (optional)

The game posts scores to a Google Sheets endpoint defined in `src/cloud.js`
(`CLOUD_URL`). If you fork this, replace that constant with your own Apps Script
Web App URL, or set it to `null` to disable cloud and run purely local.

## Deploying to production

The folder is a plain static site. Drop it anywhere:

- **Vercel** — `vercel.com`, drag the folder, done.
- **Netlify** — same thing, drag and drop.
- **GitHub Pages** — push to a repo, enable Pages in settings.
- **Any web host** — upload the folder contents via FTP.

No build step. No dependencies. No `npm install`.