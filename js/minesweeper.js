document.addEventListener('DOMContentLoaded', () => {
    const boardEl = document.getElementById('mine-board');
    const resetBtn = document.getElementById('mine-reset');
    const statusEl = document.getElementById('mine-status');
    const size = 8;
    const mines = 10;
    let board = [];

    function init() {
        boardEl.innerHTML = '';
        board = [];
        statusEl.textContent = '';
        for (let r = 0; r < size; r++) {
            const row = [];
            for (let c = 0; c < size; c++) {
                const cell = { mine: false, revealed: false, flagged: false, adj: 0, el: null };
                const btn = document.createElement('button');
                btn.className = 'mine-cell';
                btn.addEventListener('click', () => reveal(r, c));
                btn.addEventListener('contextmenu', e => { e.preventDefault(); toggleFlag(r,c); });
                boardEl.appendChild(btn);
                cell.el = btn;
                row.push(cell);
            }
            board.push(row);
        }
        placeMines();
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                board[r][c].adj = countAdj(r, c);
            }
        }
    }

    function placeMines() {
        let placed = 0;
        while (placed < mines) {
            const r = Math.floor(Math.random() * size);
            const c = Math.floor(Math.random() * size);
            if (!board[r][c].mine) {
                board[r][c].mine = true;
                placed++;
            }
        }
    }

    function countAdj(r, c) {
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr || dc) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc].mine) n++;
                }
            }
        }
        return n;
    }

    function reveal(r, c) {
        const cell = board[r][c];
        if (cell.revealed || cell.flagged) return;
        cell.revealed = true;
        cell.el.disabled = true;
        if (cell.mine) {
            cell.el.textContent = '💣';
            cell.el.classList.add('mine');
            gameOver(false);
            return;
        }
        if (cell.adj > 0) {
            cell.el.textContent = cell.adj;
        } else {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr || dc) {
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < size && nc >= 0 && nc < size) reveal(nr, nc);
                    }
                }
            }
        }
        checkWin();
    }

    function toggleFlag(r, c) {
        const cell = board[r][c];
        if (cell.revealed) return;
        cell.flagged = !cell.flagged;
        cell.el.textContent = cell.flagged ? '🚩' : '';
        checkWin();
    }

    function revealAll() {
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = board[r][c];
                if (cell.mine) {
                    cell.el.textContent = '💣';
                }
                cell.el.disabled = true;
            }
        }
    }

    function gameOver(win) {
        revealAll();
        statusEl.textContent = win ? 'Wygrana!' : 'Przegrana!';
    }

    function checkWin() {
        let safe = 0;
        let revealed = 0;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = board[r][c];
                if (!cell.mine) safe++;
                if (cell.revealed) revealed++;
            }
        }
        if (revealed === safe) gameOver(true);
    }

    resetBtn.addEventListener('click', init);
    init();
});
