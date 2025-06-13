document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const resetBtn = document.getElementById('reset');
    const status = document.getElementById('ttt-status');
    const modeSelect = document.getElementById('ttt-mode-select');
    const onlineDiv = document.getElementById('ttt-online');
    const hostBtn = document.getElementById('ttt-host');
    const joinBtn = document.getElementById('ttt-join');
    const qrContainer = document.getElementById('ttt-qr-container');
    const qrText = document.getElementById('ttt-qr-text');
    const namesHeading = document.getElementById('ttt-names');

    loadPlayerSettings();

    const X = '✖';
    const O = '⭕';
    let mode = 'ai';
    let isHost = false;
    let isMyTurn = true;
    let dc = null;
    let myName = playerSettings.name;
    let opponentName = 'Komputer';
    let mySymbol = X;
    let theirSymbol = O;
    let current = X;
    let gameOver = false;
    const cells = [];

    function createBoard() {
        board.innerHTML = '';
        cells.length = 0;
        for (let i = 0; i < 9; i++) {
            const btn = document.createElement('button');
            btn.className = 'ttt-card';
            btn.innerHTML =
                `<div class="ttt-card-inner">` +
                `<div class="ttt-card-front"></div>` +
                `<div class="ttt-card-back"></div>` +
                `</div>`;
            btn.dataset.value = '';
            btn.addEventListener('click', () => handleMove(i));
            board.appendChild(btn);
            cells.push(btn);
        }
        if (mode === 'ai') {
            status.textContent = current === O ? 'Ruch komputera...' : '';
            if (current === O) setTimeout(computerMove, 300);
        } else if (mode === 'local') {
            status.textContent = `Tura: ${current}`;
        } else if (mode === 'remote') {
            status.textContent = isMyTurn ? 'Twoja tura' : 'Tura przeciwnika';
        } else {
            status.textContent = '';
        }
    }

    function handleMove(index, remote = false) {
        const cell = cells[index];
        if (gameOver || cell.dataset.value) return;

        if (mode === 'remote') {
            if (!remote && !isMyTurn) return;
            const symbol = remote ? theirSymbol : mySymbol;
            makeMove(cell, symbol);
            if (dc && !remote) dc.send(JSON.stringify({ type: 'move', index }));
            if (checkWin()) {
                status.textContent = `Wygrał ${symbol}!`;
                gameOver = true;
                return;
            }
            if (cells.every(c => c.dataset.value)) {
                status.textContent = 'Remis!';
                gameOver = true;
                return;
            }
            isMyTurn = remote;
            status.textContent = isMyTurn ? 'Twoja tura' : 'Tura przeciwnika';
            return;
        }

        const symbol = mode === 'ai' ? X : current;
        if (mode === 'ai' && symbol !== X) return;
        makeMove(cell, symbol);
        if (checkWin()) {
            status.textContent = `Wygrał ${symbol}!`;
            gameOver = true;
            return;
        }
        if (cells.every(c => c.dataset.value)) {
            status.textContent = 'Remis!';
            gameOver = true;
            return;
        }
        if (mode === 'ai') {
            current = O;
            status.textContent = 'Ruch komputera...';
            setTimeout(computerMove, 300);
        } else if (mode === 'local') {
            current = current === X ? O : X;
            status.textContent = `Tura: ${current}`;
        }
    }

    function computerMove() {
        if (gameOver) return;
        let index = findBestMove();
        if (index === -1) {
            const emptyCells = cells
                .map((c, i) => (!c.dataset.value ? i : -1))
                .filter(i => i !== -1);
            index = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
        const cell = cells[index];
        makeMove(cell, O);
        if (checkWin()) {
            status.textContent = `Wygrał ${O}!`;
            gameOver = true;
            return;
        }
        if (cells.every(c => c.dataset.value)) {
            status.textContent = 'Remis!';
            gameOver = true;
            return;
        }
        current = X;
        status.textContent = '';
    }

    function checkWin() {
        const lines = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        return lines.some(([a,b,c]) => {
            return cells[a].dataset.value &&
                cells[a].dataset.value === cells[b].dataset.value &&
                cells[a].dataset.value === cells[c].dataset.value;
        });
    }

    function makeMove(cell, symbol) {
        const front = cell.querySelector('.ttt-card-front');
        front.textContent = symbol;
        front.classList.add(symbol === X ? 'ttt-x' : 'ttt-o');
        cell.dataset.value = symbol;
        cell.classList.add('flipped');
        cell.disabled = true;
    }

    function findBestMove() {
        const lines = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        // try to win
        for (const line of lines) {
            const values = line.map(i => cells[i].dataset.value);
            if (values.filter(v => v === O).length === 2 && values.includes('')) {
                return line[values.indexOf('')];
            }
        }
        // block human
        for (const line of lines) {
            const values = line.map(i => cells[i].dataset.value);
            if (values.filter(v => v === X).length === 2 && values.includes('')) {
                return line[values.indexOf('')];
            }
        }
        return -1;
    }

    function handleReset(remote = false) {
        gameOver = false;
        current = X;
        if (mode === 'remote') {
            isMyTurn = isHost;
            if (dc && !remote) dc.send(JSON.stringify({ type: 'reset' }));
        } else if (mode === 'ai' || mode === 'local') {
            current = X;
        }
        createBoard();
    }

    function setMode(newMode) {
        mode = newMode;
        onlineDiv.style.display = newMode === 'online' ? 'block' : 'none';
        if (newMode !== 'online') {
            dc = null;
            qrContainer.style.display = 'none';
            namesHeading.style.display = 'none';
            opponentName = newMode === 'ai' ? 'Komputer' : 'Gracz 2';
            mySymbol = X;
            theirSymbol = O;
            isMyTurn = true;
            current = X;
            handleReset(true);
        } else {
            status.textContent = '';
        }
    }

    function setupDataChannel() {
        dc.on('data', data => {
            const msg = JSON.parse(data);
            if (msg.type === 'move') {
                handleMove(msg.index, true);
            } else if (msg.type === 'reset') {
                handleReset(true);
            } else if (msg.type === 'name') {
                opponentName = msg.name;
                namesHeading.textContent = `${myName} (${mySymbol}) vs ${opponentName} (${theirSymbol})`;
            }
        });
    }

    async function startHost() {
        isHost = true;
        isMyTurn = true;
        mode = 'remote';
        myName = playerSettings.name;
        mySymbol = X;
        theirSymbol = O;
        qrContainer.style.display = 'block';
        const conn = await CodeConnect.host({ text: qrText });
        qrContainer.style.display = 'none';
        if (!conn) return;
        dc = conn.dc;
        setupDataChannel();
        dc.send(JSON.stringify({ type: 'name', name: myName }));
        namesHeading.style.display = 'block';
        namesHeading.textContent = `${myName} (${mySymbol}) vs ...`;
        handleReset(true);
    }

    async function startJoin() {
        isHost = false;
        isMyTurn = false;
        mode = 'remote';
        myName = playerSettings.name;
        mySymbol = O;
        theirSymbol = X;
        qrContainer.style.display = 'block';
        const conn = await CodeConnect.join({ text: qrText });
        qrContainer.style.display = 'none';
        if (!conn) return;
        dc = conn.dc;
        setupDataChannel();
        dc.send(JSON.stringify({ type: 'name', name: myName }));
        namesHeading.style.display = 'block';
        namesHeading.textContent = `${myName} (${mySymbol}) vs ...`;
        handleReset(true);
    }

    resetBtn.addEventListener('click', () => handleReset());
    modeSelect.addEventListener('change', () => setMode(modeSelect.value));
    hostBtn.addEventListener('click', startHost);
    joinBtn.addEventListener('click', startJoin);

    setMode('ai');
});
