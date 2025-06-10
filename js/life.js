document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('life-board');
    const startBtn = document.getElementById('life-start');
    const attackInput = document.getElementById('stat-attack');
    const defenseInput = document.getElementById('stat-defense');
    const speedInput = document.getElementById('stat-speed');
    const remainingSpan = document.getElementById('points-remaining');
    const size = 20;
    let cells = [];
    let microbes = [];
    let timer = null;

    function createBoard() {
        board.innerHTML = '';
        cells = [];
        for (let r = 0; r < size; r++) {
            const row = [];
            for (let c = 0; c < size; c++) {
                const cell = document.createElement('div');
                board.appendChild(cell);
                row.push(cell);
            }
            cells.push(row);
        }
    }

    function updateRemaining() {
        const total = +attackInput.value + +defenseInput.value + +speedInput.value;
        remainingSpan.textContent = 10 - total;
    }

    attackInput.addEventListener('input', updateRemaining);
    defenseInput.addEventListener('input', updateRemaining);
    speedInput.addEventListener('input', updateRemaining);

    function randomStats() {
        let points = 10;
        const stats = {attack: 0, defense: 0, speed: 0};
        const keys = Object.keys(stats);
        while (points > 0) {
            const k = keys[Math.floor(Math.random() * keys.length)];
            stats[k]++;
            points--;
        }
        return stats;
    }

    function draw() {
        cells.flat().forEach(c => {
            c.className = '';
        });
        microbes.forEach(m => {
            const cell = cells[m.y][m.x];
            cell.classList.add(m.isPlayer ? 'player' : 'enemy');
        });
    }

    function move(m) {
        for (let s = 0; s < m.speed; s++) {
            const dir = Math.floor(Math.random() * 4);
            if (dir === 0 && m.y > 0) m.y--; // up
            if (dir === 1 && m.y < size - 1) m.y++; // down
            if (dir === 2 && m.x > 0) m.x--; // left
            if (dir === 3 && m.x < size - 1) m.x++; // right
        }
    }

    function fight(a, b) {
        const aScore = a.attack + Math.random() * a.speed - b.defense;
        const bScore = b.attack + Math.random() * b.speed - a.defense;
        return aScore >= bScore ? b : a;
    }

    function step() {
        microbes.forEach(move);
        for (let i = microbes.length - 1; i >= 0; i--) {
            for (let j = i - 1; j >= 0; j--) {
                if (microbes[i].x === microbes[j].x && microbes[i].y === microbes[j].y) {
                    const loser = fight(microbes[i], microbes[j]);
                    microbes.splice(microbes.indexOf(loser), 1);
                    if (loser.isPlayer) endGame(false);
                    break;
                }
            }
        }
        draw();
        if (microbes.length === 1 && microbes[0].isPlayer) {
            endGame(true);
        }
    }

    function endGame(win) {
        clearInterval(timer);
        timer = null;
        setTimeout(() => {
            alert(win ? 'Przetrwałeś!' : 'Twój organizm zginął.');
        }, 10);
    }

    startBtn.addEventListener('click', () => {
        const total = +attackInput.value + +defenseInput.value + +speedInput.value;
        if (total > 10) {
            alert('Za dużo punktów!');
            return;
        }
        clearInterval(timer);
        createBoard();
        microbes = [];
        const player = {
            x: Math.floor(Math.random() * size),
            y: Math.floor(Math.random() * size),
            attack: +attackInput.value,
            defense: +defenseInput.value,
            speed: +speedInput.value,
            isPlayer: true
        };
        microbes.push(player);
        for (let i = 0; i < 5; i++) {
            const s = randomStats();
            microbes.push({
                x: Math.floor(Math.random() * size),
                y: Math.floor(Math.random() * size),
                attack: s.attack,
                defense: s.defense,
                speed: s.speed,
                isPlayer: false
            });
        }
        draw();
        timer = setInterval(step, 500);
    });

    createBoard();
    updateRemaining();
});
