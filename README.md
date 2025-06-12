# chatgpt_codex_tests

This repository was created to test the ChatGPT Codex tool and contains a small number of example demos: <https://pawelwielga.github.io/chatgpt_codex_tests/index.html>

## Project overview

The site consists of several lightweight browser games written in plain HTML, CSS and vanilla JavaScript. Each game lives in its own folder inside the `games/` directory and includes a dedicated `*.html`, `*.js` and `*.css` file. All pages share styles from `css/common.css` and a simple footer injected by `js/footer.js`. Player preferences such as name, colour and emoji are stored in `localStorage` via `js/player-settings.js` and can be changed on the `settings.html` page.

A helper module provides optional online play:

* `js/codeconnect.js` – uses [PeerJS](https://peerjs.com/) to establish a data channel between players identified by short 5‑character codes.

Bootstrap and Bootstrap Icons (loaded from a CDN) supply the basic layout and icons across all pages. The only additional framework is [three.js](https://threejs.org/) which powers the rotating 3D cube demo.

* **Kółko i Krzyżyk (Tic‑Tac‑Toe)** – classic 3×3 board where you play as ✖ against a simple computer opponent.
* **Memo** – flip cards to find matching emoji pairs while the game counts your moves.
* **Kostka 3D** – interactive rotating cube built with three.js. Drag to rotate and view all sides.
* **Gra w życie** – simulation of simple organisms. Configure a creature with attack, defense and speed stats and try to survive by eating, hunting and reproducing in a tiny ecosystem.
* **Wąż** – traditional Snake. Collect food to grow longer without hitting walls or yourself.
* **Kamień, Papier, Nożyce** – simple duel against the computer. Choose your symbol and see who wins.
* **Saper** – classic Minesweeper. Uncover all safe fields without detonating a mine.
* **Catculator** – basic calculator with pink and purple theme. The digit buttons are styled as cute cat heads.
* **Tetris** – classic falling-block puzzle with on‑screen arrow controls.
* **Connect 4** – drop discs to line up four in a row. You can play locally against another person, challenge the computer or set up an online match via PeerJS using short 5-character codes – no local server needed.
* **Pong** – classic paddle and ball game for two players.
* **Gorący Ziemniak** – prosta gra imprezowa dla wielu osób. Jeden z graczy trzyma "ziemniaka" i musi przekazać go dalej nim upłynie czas.
* **Talia Kart** – prezentacja talii kart ułożonej na stoliku z lekkim efektem 3D.

Most of the games are meant for local play but **Connect 4**, **Rock Paper Scissors** and **Gorący Ziemniak** also allow remote matches using the connection helpers described above. No external server is required – the games communicate directly between browsers.

The repository is entirely static so it can be hosted on GitHub Pages or any basic web server without a build step. Feel free to browse the source code for each mini-game to see straightforward implementations of classic browser games.
