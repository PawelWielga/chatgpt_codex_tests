document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('snake-board');
    const startBtn = document.getElementById('snake-start');
    const scoreSpan = document.getElementById('snake-score');
    const size = 20;
    let cells = [];
    let snake = [];
    let direction = {x: 1, y: 0};
    let food = {x: 0, y: 0};
    let timer = null;
    let score = 0;

    function createBoard() {
        board.innerHTML = '';
        cells = [];
        for (let r = 0; r < size; r++) {
            const row = [];
            for (let c = 0; c < size; c++) {
                const div = document.createElement('div');
                board.appendChild(div);
                row.push(div);
            }
            cells.push(row);
        }
    }

    function draw() {
        cells.flat().forEach(c => c.className = '');
        snake.forEach(seg => {
            cells[seg.y][seg.x].classList.add('snake');
        });
        cells[food.y][food.x].classList.add('food');
        scoreSpan.textContent = score;
    }

    function placeFood() {
        let empty = [];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (!snake.some(s => s.x === x && s.y === y)) {
                    empty.push({x, y});
                }
            }
        }
        food = empty[Math.floor(Math.random() * empty.length)];
    }

    function step() {
        const head = {...snake[0]};
        head.x += direction.x;
        head.y += direction.y;
        if (head.x < 0 || head.x >= size || head.y < 0 || head.y >= size ||
            snake.some(s => s.x === head.x && s.y === head.y)) {
            endGame();
            return;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score++;
            placeFood();
        } else {
            snake.pop();
        }
        draw();
    }

    function endGame() {
        clearInterval(timer);
        timer = null;
        alert('Koniec gry! Wynik: ' + score);
    }

    function startGame() {
        clearInterval(timer);
        snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        direction = {x: 1, y: 0};
        score = 0;
        placeFood();
        draw();
        timer = setInterval(step, 200);
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp' && direction.y !== 1) direction = {x: 0, y: -1};
        if (e.key === 'ArrowDown' && direction.y !== -1) direction = {x: 0, y: 1};
        if (e.key === 'ArrowLeft' && direction.x !== 1) direction = {x: -1, y: 0};
        if (e.key === 'ArrowRight' && direction.x !== -1) direction = {x: 1, y: 0};
    });

    startBtn.addEventListener('click', startGame);

    createBoard();
});
