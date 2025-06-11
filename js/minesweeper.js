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
                btn.innerHTML = '<div class="mine-cell-inner"><div class="mine-cell-front"></div><div class="mine-cell-back"></div></div>';
                btn.addEventListener('click', () => revealWave(r, c));
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

    function revealCell(r, c) {
        const cell = board[r][c];
        if (cell.revealed || cell.flagged) return;
        cell.revealed = true;
        const front = cell.el.querySelector('.mine-cell-front');
        const back = cell.el.querySelector('.mine-cell-back');
        if (cell.mine) {
            front.textContent = '💣';
            cell.el.classList.add('mine');
            flipCell(cell);
            gameOver(false);
            return;
        }
        if (cell.adj > 0) {
            front.textContent = cell.adj;
        }
        flipCell(cell);
    }

    function flipCell(cell) {
        const el = cell.el;
        el.classList.add('flipped');
        setTimeout(() => {
            el.classList.add('revealed');
        }, 400);
    }

    function revealWave(sr, sc) {
        const queue = [{r: sr, c: sc, d: 0}];
        const seen = new Set();
        while (queue.length) {
            const {r, c, d} = queue.shift();
            if (r < 0 || c < 0 || r >= size || c >= size) continue;
            const key = r + ',' + c;
            if (seen.has(key)) continue;
            seen.add(key);
            const cell = board[r][c];
            if (cell.flagged || cell.revealed) continue;
            setTimeout(() => {
                revealCell(r, c);
                if (!cell.mine) checkWin();
            }, d * 60);
            if (!cell.mine && cell.adj === 0) {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr || dc) queue.push({r: r + dr, c: c + dc, d: d + 1});
                    }
                }
            }
            if (cell.mine) {
                // Stop expanding when a mine is hit
                break;
            }
        }
    }

    function toggleFlag(r, c) {
        const cell = board[r][c];
        if (cell.revealed) return;
        cell.flagged = !cell.flagged;
        const back = cell.el.querySelector('.mine-cell-back');
        back.textContent = cell.flagged ? '🚩' : '';
        checkWin();
    }

    function revealAll() {
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = board[r][c];
                if (cell.revealed) continue;
                const front = cell.el.querySelector('.mine-cell-front');
                const back = cell.el.querySelector('.mine-cell-back');
                back.textContent = '';
                if (cell.mine) {
                    front.textContent = '💣';
                    cell.el.classList.add('mine');
                } else if (cell.adj > 0) {
                    front.textContent = cell.adj;
                }
                flipCell(cell);
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
