document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('life-board');
    const startBtn = document.getElementById('life-start');
    const stopBtn = document.getElementById('life-stop');
    const randomBtn = document.getElementById('life-random');
    const size = 20;
    let cells = [];
    let timer = null;

    function createBoard() {
        board.innerHTML = '';
        cells = [];
        for (let r = 0; r < size; r++) {
            const row = [];
            for (let c = 0; c < size; c++) {
                const cell = document.createElement('div');
                cell.addEventListener('click', () => cell.classList.toggle('alive'));
                board.appendChild(cell);
                row.push(cell);
            }
            cells.push(row);
        }
    }

    function randomize() {
        cells.forEach(row => row.forEach(cell => {
            if (Math.random() > 0.7) cell.classList.add('alive');
            else cell.classList.remove('alive');
        }));
    }

    function countAlive(states, r, c) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const rr = r + dr;
                const cc = c + dc;
                if (rr >= 0 && rr < size && cc >= 0 && cc < size && states[rr][cc]) {
                    count++;
                }
            }
        }
        return count;
    }

    function step() {
        const states = cells.map(row => row.map(cell => cell.classList.contains('alive')));
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const alive = states[r][c];
                const n = countAlive(states, r, c);
                if (alive && (n < 2 || n > 3)) cells[r][c].classList.remove('alive');
                else if (!alive && n === 3) cells[r][c].classList.add('alive');
            }
        }
    }

    startBtn.addEventListener('click', () => {
        if (!timer) timer = setInterval(step, 300);
    });

    stopBtn.addEventListener('click', () => {
        clearInterval(timer);
        timer = null;
    });

    randomBtn.addEventListener('click', randomize);

    createBoard();
    randomize();
});
