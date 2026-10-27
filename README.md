# Bangladesh Bike Rush 3D

A mobile-friendly 3D browser bike traffic game made with Three.js.

## Play locally
Because this project uses JavaScript modules, use a local web server (not file://).
- VS Code: install Live Server, then right-click `index.html` → Open with Live Server.
- Python: run `python -m http.server 8000` in this folder, then visit `http://localhost:8000`.

## Controls
- PC: Left/Right arrows or A/D to steer, Up/W to boost, Escape to pause.
- Mobile: use the left/right touch buttons and Boost.
- Use the fullscreen button to enter fullscreen.

## Deploy to Vercel
Import this repository into Vercel. Choose Framework Preset `Other`, leave Build Command blank, and set Output Directory to `.`. Three.js loads from jsDelivr, so internet is required.
