document.addEventListener('DOMContentLoaded', () => {
    const boardDiv = document.getElementById('connect4-board');
    const statusP = document.getElementById('connect4-status');
    const resetBtn = document.getElementById('connect4-reset');
    const rows = 6;
    const cols = 7;
    let board = [];
    let current = 'red';
    let gameOver = false;

    function display(player) {
        return player === 'red' ? 'Czerwony' : 'Żółty';
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
                div.addEventListener('click', () => handleMove(c));
                boardDiv.appendChild(div);
            }
        }
        current = 'red';
        gameOver = false;
        statusP.textContent = `Tura: ${display(current)}`;
    }

    function handleMove(col) {
        if (gameOver) return;
        for (let r = rows - 1; r >= 0; r--) {
            if (!board[r][col]) {
                board[r][col] = current;
                const cell = boardDiv.querySelector(`[data-row='${r}'][data-col='${col}']`);
                cell.classList.add(current);
                if (checkWin(r, col)) {
                    statusP.textContent = `Wygrywa ${display(current)}!`;
                    gameOver = true;
                } else if (board.every(row => row.every(c => c))) {
                    statusP.textContent = 'Remis!';
                    gameOver = true;
                } else {
                    current = current === 'red' ? 'yellow' : 'red';
                    statusP.textContent = `Tura: ${display(current)}`;
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

    resetBtn.addEventListener('click', createBoard);
    createBoard();
});
