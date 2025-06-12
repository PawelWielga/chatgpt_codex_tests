document.addEventListener('DOMContentLoaded', () => {
    const boardDiv = document.getElementById('connect4-board');
    const wrapperDiv = document.getElementById('connect4-wrapper');
    const overlaySvg = document.getElementById('connect4-overlay');
    const statusP = document.getElementById('connect4-status');
    const resetBtn = document.getElementById('connect4-reset');
    const hostBtn = document.getElementById('host-btn');
    const joinBtn = document.getElementById('join-btn');
    const qrContainer = document.getElementById('qr-container');
    const qrText = document.getElementById('qr-text');
    const rows = 6;
    const cols = 7;
    const styles = getComputedStyle(document.documentElement);
    const boardColor = styles.getPropertyValue('--board-color').trim();
    const borderColor = styles.getPropertyValue('--border-color').trim();
    const emojis = [
        "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁",
        "🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🐣","🐥","🦆",
        "🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌",
        "🐞","🐜","🪲","🪳","🐢","🐍","🦎","🦂","🕷"
    ];
    let mode = 'local';
    let isHost = false;
    let isMyTurn = false;
    let dc = null;
    let board = [];
    let current = 'red';
    let gameOver = false;
    let animating = false;
    let cellSize = 60;
    let gapSize = 5;
    let padSize = 5;

    function display(player) {
        return player === 'red' ? 'Czerwony' : 'Żółty';
    }

    function setupDataChannel() {
        dc.onmessage = e => {
            const msg = JSON.parse(e.data);
            if (msg.type === 'move') {
                handleMove(msg.col, true);
            } else if (msg.type === 'reset') {
                createBoard();
                isMyTurn = isHost;
            }
        };
    }

    async function startHost() {
        isHost = true;
        isMyTurn = true;
        mode = 'remote';
        qrContainer.style.display = 'block';
        const elems = { text: qrText };
        const conn = await CodeConnect.host(elems);
        qrContainer.style.display = 'none';
        if (!conn) return;
        dc = conn.dc;
        setupDataChannel();
        createBoard();
        statusP.textContent = `Tura: ${display(current)}`;
    }

    async function startJoin() {
        isHost = false;
        isMyTurn = false;
        mode = 'remote';
        qrContainer.style.display = 'block';
        const elems = { text: qrText };
        const conn = await CodeConnect.join(elems);
        qrContainer.style.display = 'none';
        if (!conn) return;
        dc = conn.dc;
        setupDataChannel();
        createBoard();
        statusP.textContent = `Tura: ${display(current)}`;
    }

    function resizeBoard() {
        const ratio = 10 / 60;
        const maxWidth = Math.min(window.innerWidth - 20, 450);
        const denom = cols + (cols - 1) * ratio + 2 * ratio;
        cellSize = Math.floor(maxWidth / denom);
        gapSize = Math.round(cellSize * ratio);
        padSize = gapSize;
        const boardWidth = cellSize * cols + gapSize * (cols - 1) + padSize * 2;
        const boardHeight = cellSize * rows + gapSize * (rows - 1) + padSize * 2;
        document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
        document.documentElement.style.setProperty('--gap-size', `${gapSize}px`);
        document.documentElement.style.setProperty('--board-padding', `${padSize}px`);
        wrapperDiv.style.width = boardWidth + 'px';
        wrapperDiv.style.height = boardHeight + 'px';
        drawOverlay();
    }

    function drawOverlay() {
        const ns = 'http://www.w3.org/2000/svg';
        overlaySvg.setAttribute('width', wrapperDiv.clientWidth);
        overlaySvg.setAttribute('height', wrapperDiv.clientHeight);
        overlaySvg.innerHTML = '';

        const defs = document.createElementNS(ns, 'defs');
        const mask = document.createElementNS(ns, 'mask');
        mask.setAttribute('id', 'holes');
        const rectMask = document.createElementNS(ns, 'rect');
        rectMask.setAttribute('width', '100%');
        rectMask.setAttribute('height', '100%');
        rectMask.setAttribute('fill', 'white');
        mask.appendChild(rectMask);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const circle = document.createElementNS(ns, 'circle');
                circle.setAttribute('cx', padSize + c * (cellSize + gapSize) + cellSize / 2);
                circle.setAttribute('cy', padSize + r * (cellSize + gapSize) + cellSize / 2);
                circle.setAttribute('r', cellSize / 2);
                circle.setAttribute('fill', 'black');
                mask.appendChild(circle);
            }
        }
        defs.appendChild(mask);
        overlaySvg.appendChild(defs);

        const boardRect = document.createElementNS(ns, 'rect');
        boardRect.setAttribute('width', '100%');
        boardRect.setAttribute('height', '100%');
        boardRect.setAttribute('fill', boardColor);
        boardRect.setAttribute('stroke', borderColor);
        boardRect.setAttribute('stroke-width', '4');
        boardRect.setAttribute('mask', 'url(#holes)');
        overlaySvg.appendChild(boardRect);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const outline = document.createElementNS(ns, 'circle');
                outline.setAttribute('cx', padSize + c * (cellSize + gapSize) + cellSize / 2);
                outline.setAttribute('cy', padSize + r * (cellSize + gapSize) + cellSize / 2);
                outline.setAttribute('r', cellSize / 2);
                outline.setAttribute('fill', 'none');
                outline.setAttribute('stroke', borderColor);
                outline.setAttribute('stroke-width', '2');
                overlaySvg.appendChild(outline);
            }
        }
    }

    function createBoard() {
        boardDiv.innerHTML = '';
        board = Array.from({ length: rows }, () => Array(cols).fill(null));
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const div = document.createElement('div');
                div.className = 'cell';
                div.dataset.row = r;
                div.dataset.col = c;
                div.textContent = '';
                div.addEventListener('click', () => handleMove(c));
                boardDiv.appendChild(div);
            }
        }
        current = 'red';
        gameOver = false;
        animating = false;
        statusP.textContent = `Tura: ${display(current)}`;
    }

    function handleMove(col, remote = false) {
        if (gameOver || animating) return;
        if (mode === 'remote' && !remote && !isMyTurn) return;
        for (let r = rows - 1; r >= 0; r--) {
            if (!board[r][col]) {
                const cell = boardDiv.querySelector(`[data-row='${r}'][data-col='${col}']`);

                animating = true;
                const disc = document.createElement('div');
                disc.className = `cell drop-disc ${current}`;
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                disc.textContent = emoji;
                disc.style.left = cell.offsetLeft + 'px';
                disc.style.top = -cellSize + 'px';
                boardDiv.appendChild(disc);

                requestAnimationFrame(() => {
                    disc.style.top = cell.offsetTop + 'px';
                });

                disc.addEventListener('transitionend', () => {
                    boardDiv.removeChild(disc);
                    board[r][col] = current;
                    cell.classList.add(current);
                    cell.textContent = emoji;
                    if (checkWin(r, col)) {
                        statusP.textContent = `Wygrywa ${display(current)}!`;
                        gameOver = true;
                    } else if (board.every(row => row.every(c => c))) {
                        statusP.textContent = 'Remis!';
                        gameOver = true;
                    } else {
                        current = current === 'red' ? 'yellow' : 'red';
                        statusP.textContent = `Tura: ${display(current)}`;
                        if (mode === 'remote') {
                            isMyTurn = !isMyTurn;
                        }
                    }
                    animating = false;
                }, {once: true});
                if (mode === 'remote' && !remote) {
                    dc.send(JSON.stringify({type:'move', col}));
                }
                break;
            }
        }
    }

    function countDir(r, c, dr, dc) {
        let color = board[r][c];
        let count = 0;
        let nr = r + dr;
        let nc = c + dc;
        while (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === color) {
            count++;
            nr += dr;
            nc += dc;
        }
        return count;
    }

    function checkWin(r, c) {
        const directions = [
            [0, 1],
            [1, 0],
            [1, 1],
            [1, -1]
        ];
        return directions.some(([dr, dc]) => {
            return 1 + countDir(r, c, dr, dc) + countDir(r, c, -dr, -dc) >= 4;
        });
    }

    resetBtn.addEventListener('click', () => {
        createBoard();
        if (mode === 'remote' && dc) {
            dc.send(JSON.stringify({type:'reset'}));
            isMyTurn = isHost;
        }
    });
    hostBtn.addEventListener('click', startHost);
    joinBtn.addEventListener('click', startJoin);
    window.addEventListener('resize', resizeBoard);
    resizeBoard();
    createBoard();
});
