document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const resetBtn = document.getElementById('reset');
    const human = 'X';
    const ai = 'O';
    let current = human;
    let gameOver = false;
    const cells = [];

    function createBoard() {
        board.innerHTML = '';
        cells.length = 0;
        for (let i = 0; i < 9; i++) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-light';
            btn.addEventListener('click', () => handleMove(i));
            board.appendChild(btn);
            cells.push(btn);
        }
    }

    function handleMove(index) {
        if (gameOver || cells[index].textContent || current !== human) return;
        cells[index].textContent = human;
        if (checkWin()) {
            alert(`Wygrał ${human}!`);
            gameOver = true;
            return;
        }
        if (cells.every(c => c.textContent)) {
            alert('Remis!');
            gameOver = true;
            return;
        }
        current = ai;
        setTimeout(computerMove, 300);
    }

    function computerMove() {
        if (gameOver) return;
        const empty = cells.filter(c => !c.textContent);
        if (empty.length === 0) return;
        const cell = empty[Math.floor(Math.random() * empty.length)];
        cell.textContent = ai;
        if (checkWin()) {
            alert(`Wygrał ${ai}!`);
            gameOver = true;
            return;
        }
        if (cells.every(c => c.textContent)) {
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
            return cells[a].textContent &&
                cells[a].textContent === cells[b].textContent &&
                cells[a].textContent === cells[c].textContent;
        });
    }

    resetBtn.addEventListener('click', () => {
        current = human;
        gameOver = false;
        createBoard();
    });

    createBoard();
});
