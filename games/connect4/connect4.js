document.addEventListener('DOMContentLoaded', () => {
    const boardDiv = document.getElementById('connect4-board');
    const wrapperDiv = document.getElementById('connect4-wrapper');
    const overlaySvg = document.getElementById('connect4-overlay');
    const statusP = document.getElementById('connect4-status');
    const resetBtn = document.getElementById('connect4-reset');
    const hostBtn = document.getElementById('host-btn');
    const joinBtn = document.getElementById('join-btn');
    const connect4Online = document.getElementById('connect4-online');
    const qrContainer = document.getElementById('qr-container');
    const qrText = document.getElementById('qr-text');
    const namesHeading = document.getElementById('player-names');
    const infoP = document.getElementById('player-info');
    const modeSelect = document.getElementById('mode-select');
    const rows = 6;
    const cols = 7;
    const styles = getComputedStyle(document.documentElement);
    const boardColor = styles.getPropertyValue('--board-color').trim();
    const borderColor = styles.getPropertyValue('--border-color').trim();
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
    let myName = '';
    let opponentName = '';
    loadPlayerSettings();
    const players = {
        red: { name: playerSettings.name, color: playerSettings.color, emoji: playerSettings.emoji },
        yellow: { name: 'Żółty', color: '#ffc107', emoji: '🐱' }
    };

    function display(player) {
        return players[player].name;
    }

    function updateNamesDisplay() {
        if (namesHeading) {
            namesHeading.textContent = `${players.red.name} vs ${players.yellow.name}`;
            namesHeading.style.display = 'block';
        }
    }

    function updateInfo() {
        if (infoP) {
            const badge = `<span class="badge" style="background-color: ${players.red.color}; color: #fff;">${players.red.name} ${players.red.emoji}</span>`;
            infoP.innerHTML = `Grasz jako ${badge}`;
        }
    }

    function setMode(newMode) {
        mode = newMode;
        connect4Online.style.display = newMode === 'online' ? 'block' : 'none';
        if (newMode !== 'online') {
            dc = null;
            qrContainer.style.display = 'none';
            namesHeading.style.display = 'none';
            players.red.name = playerSettings.name;
            players.red.color = playerSettings.color;
            players.red.emoji = playerSettings.emoji;
            if (newMode === 'ai') {
                players.yellow.name = 'Komputer';
                players.yellow.color = '#ffc107';
                players.yellow.emoji = '💻';
            } else {
                players.yellow.name = 'Żółty';
                players.yellow.color = '#ffc107';
                players.yellow.emoji = '🐱';
            }
            createBoard();
            updateNamesDisplay();
            updateInfo();
        } else {
            statusP.textContent = '';
            updateInfo();
        }
    }

    function setupDataChannel() {
        dc.on('data', data => {
            const msg = JSON.parse(data);
            if (msg.type === 'move') {
                handleMove(msg.col, true);
            } else if (msg.type === 'reset') {
                createBoard();
                isMyTurn = isHost;
            } else if (msg.type === 'name') {
                opponentName = msg.name;
                if (isHost) {
                    players.yellow.name = opponentName;
                    if (msg.color) players.yellow.color = msg.color;
                    if (msg.emoji) players.yellow.emoji = msg.emoji;
                } else {
                    players.red.name = opponentName;
                    if (msg.color) players.red.color = msg.color;
                    if (msg.emoji) players.red.emoji = msg.emoji;
                }
                updateNamesDisplay();
            }
        });
    }

    async function startHost() {
        isHost = true;
        isMyTurn = true;
        mode = 'remote';
        myName = playerSettings.name;
        players.red.name = myName;
        players.red.color = playerSettings.color;
        players.red.emoji = playerSettings.emoji;
        updateInfo();
        qrContainer.style.display = 'block';
        const elems = { text: qrText };
        const conn = await CodeConnect.host(elems);
        qrContainer.style.display = 'none';
        if (!conn) return;
        dc = conn.dc;
        setupDataChannel();
        dc.send(JSON.stringify({type:'name', name: myName, color: players.red.color, emoji: players.red.emoji}));
        createBoard();
        statusP.textContent = `Tura: ${display(current)}`;
        updateNamesDisplay();
    }

    async function startJoin() {
        isHost = false;
        isMyTurn = false;
        mode = 'remote';
        myName = playerSettings.name;
        players.yellow.name = myName;
        players.yellow.color = playerSettings.color;
        players.yellow.emoji = playerSettings.emoji;
        updateInfo();
        qrContainer.style.display = 'block';
        const elems = { text: qrText };
        const conn = await CodeConnect.join(elems);
        qrContainer.style.display = 'none';
        if (!conn) return;
        dc = conn.dc;
        setupDataChannel();
        dc.send(JSON.stringify({type:'name', name: myName, color: players.yellow.color, emoji: players.yellow.emoji}));
        createBoard();
        statusP.textContent = `Tura: ${display(current)}`;
        updateNamesDisplay();
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
                disc.className = 'cell drop-disc';
                disc.style.backgroundColor = players[current].color;
                const emoji = players[current].emoji;
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
                    cell.style.backgroundColor = players[current].color;
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
                    if (mode === 'ai' && !gameOver && current === 'yellow') {
                        setTimeout(aiMove, 300);
                    }
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

    function checkVirtualWin(b, r, c) {
        const color = b[r][c];
        const dirs = [[0,1],[1,0],[1,1],[1,-1]];
        for (const [dr,dc] of dirs) {
            let count = 1;
            let nr = r+dr, nc = c+dc;
            while (nr>=0 && nr<rows && nc>=0 && nc<cols && b[nr][nc] === color) { count++; nr+=dr; nc+=dc; }
            nr = r-dr; nc = c-dc;
            while (nr>=0 && nr<rows && nc>=0 && nc<cols && b[nr][nc] === color) { count++; nr-=dr; nc-=dc; }
            if (count >= 4) return true;
        }
        return false;
    }

    function chooseAIMove() {
        const available = [];
        for (let c=0;c<cols;c++) {
            for (let r=rows-1;r>=0;r--) {
                if (!board[r][c]) { available.push({c,r}); break; }
            }
        }
        for (const {c,r} of available) {
            board[r][c] = 'yellow';
            if (checkVirtualWin(board, r, c)) { board[r][c] = null; return c; }
            board[r][c] = null;
        }
        for (const {c,r} of available) {
            board[r][c] = 'red';
            if (checkVirtualWin(board, r, c)) { board[r][c] = null; return c; }
            board[r][c] = null;
        }
        const opts = available.map(o=>o.c);
        return opts[Math.floor(Math.random()*opts.length)];
    }

    function aiMove() {
        if (gameOver) return;
        const col = chooseAIMove();
        if (col !== undefined) {
            handleMove(col);
        }
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
    modeSelect.addEventListener('change', () => setMode(modeSelect.value));
    window.addEventListener('resize', resizeBoard);
    resizeBoard();
    setMode('local');
});
