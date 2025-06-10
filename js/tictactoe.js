document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const resetBtn = document.getElementById('reset');
    const human = '❌';
    const ai = '⭕';
    let current = human;
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
    }

    function handleMove(index) {
        const cell = cells[index];
        if (gameOver || cell.dataset.value || current !== human) return;
        makeMove(cell, human);
        if (checkWin()) {
            alert(`Wygrał ${human}!`);
            gameOver = true;
            return;
        }
        if (cells.every(c => c.dataset.value)) {
            alert('Remis!');
            gameOver = true;
            return;
        }
        current = ai;
        setTimeout(computerMove, 300);
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
        makeMove(cell, ai);
        if (checkWin()) {
            alert(`Wygrał ${ai}!`);
            gameOver = true;
            return;
        }
        if (cells.every(c => c.dataset.value)) {
            alert('Remis!');
            gameOver = true;
            return;
        }
        current = human;
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
            if (values.filter(v => v === ai).length === 2 && values.includes('')) {
                return line[values.indexOf('')];
            }
        }
        // block human
        for (const line of lines) {
            const values = line.map(i => cells[i].dataset.value);
            if (values.filter(v => v === human).length === 2 && values.includes('')) {
                return line[values.indexOf('')];
            }
        }
        return -1;
    }

    resetBtn.addEventListener('click', () => {
        current = human;
        gameOver = false;
        createBoard();
    });

    createBoard();
});
