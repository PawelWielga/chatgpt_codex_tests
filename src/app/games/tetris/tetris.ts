export function initTetris() {
    const board = document.getElementById('tetris-board');
    const startBtn = document.getElementById('tetris-start');
    const scoreSpan = document.getElementById('tetris-score');
    const btnRotate = document.getElementById('tetris-rotate');
    const btnLeft = document.getElementById('tetris-left');
    const btnRight = document.getElementById('tetris-right');
    const btnDown = document.getElementById('tetris-down');

    const width = 10;
    const height = 20;
    let cells = [];
    let state = [];
    let current = null;
    let timer = null;
    let score = 0;

    const shapes = [
        {color: '#0dcaf0', blocks: [[0,1],[1,1],[2,1],[3,1]]}, // I
        {color: '#ffc107', blocks: [[0,0],[1,0],[0,1],[1,1]]}, // O
        {color: '#6f42c1', blocks: [[1,0],[0,1],[1,1],[2,1]]}, // T
        {color: '#198754', blocks: [[1,0],[2,0],[0,1],[1,1]]}, // S
        {color: '#dc3545', blocks: [[0,0],[1,0],[1,1],[2,1]]}, // Z
        {color: '#0d6efd', blocks: [[0,0],[0,1],[1,1],[2,1]]}, // J
        {color: '#fd7e14', blocks: [[2,0],[0,1],[1,1],[2,1]]}  // L
    ];

    function createBoard() {
        board.innerHTML = '';
        cells = [];
        state = [];
        for (let r = 0; r < height; r++) {
            const row = [];
            state.push(Array(width).fill(null));
            for (let c = 0; c < width; c++) {
                const div = document.createElement('div');
                board.appendChild(div);
                row.push(div);
            }
            cells.push(row);
        }
    }

    function draw() {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                cells[y][x].style.backgroundColor = state[y][x] || '#e9ecef';
            }
        }
        if (current) {
            current.blocks.forEach(([bx, by]) => {
                const x = current.x + bx;
                const y = current.y + by;
                if (y >= 0) {
                    cells[y][x].style.backgroundColor = current.color;
                }
            });
        }
        scoreSpan.textContent = score;
    }

    function canMove(dx, dy, blocks = null) {
        const shape = blocks || current.blocks;
        for (const [bx, by] of shape) {
            const x = current.x + bx + dx;
            const y = current.y + by + dy;
            if (x < 0 || x >= width || y >= height) return false;
            if (y >= 0 && state[y][x]) return false;
        }
        return true;
    }

    function rotate() {
        const rotated = current.blocks.map(([x, y]) => [y, -x]);
        const minX = Math.min(...rotated.map(b => b[0]));
        const minY = Math.min(...rotated.map(b => b[1]));
        rotated.forEach(b => { b[0] -= minX; b[1] -= minY; });
        if (canMove(0, 0, rotated)) {
            current.blocks = rotated;
            draw();
        }
    }

    function move(dx, dy) {
        if (canMove(dx, dy)) {
            current.x += dx;
            current.y += dy;
            draw();
            return true;
        }
        return false;
    }

    function mergePiece() {
        current.blocks.forEach(([bx, by]) => {
            const x = current.x + bx;
            const y = current.y + by;
            if (y >= 0) {
                state[y][x] = current.color;
            }
        });
    }

    function clearLines() {
        for (let y = height - 1; y >= 0; ) {
            if (state[y].every(c => c)) {
                state.splice(y, 1);
                state.unshift(Array(width).fill(null));
                score++;
            } else {
                y--;
            }
        }
    }

    function spawnPiece() {
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        current = {
            x: 3,
            y: -1,
            blocks: shape.blocks.map(b => b.slice()),
            color: shape.color
        };
        if (!canMove(0, 1)) {
            endGame();
        }
    }

    function step() {
        if (!move(0, 1)) {
            mergePiece();
            clearLines();
            spawnPiece();
        }
        draw();
    }

    function startGame() {
        clearInterval(timer);
        score = 0;
        createBoard();
        spawnPiece();
        draw();
        timer = setInterval(step, 500);
    }

    function endGame() {
        clearInterval(timer);
        timer = null;
        draw();
        alert('Koniec gry! Wynik: ' + score);
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') move(-1, 0);
        if (e.key === 'ArrowRight') move(1, 0);
        if (e.key === 'ArrowDown') step();
        if (e.key === 'ArrowUp') rotate();
    });

    if (btnLeft) btnLeft.addEventListener('click', () => move(-1, 0));
    if (btnRight) btnRight.addEventListener('click', () => move(1, 0));
    if (btnDown) btnDown.addEventListener('click', () => step());
    if (btnRotate) btnRotate.addEventListener('click', () => rotate());

    startBtn.addEventListener('click', startGame);

    createBoard();
}
