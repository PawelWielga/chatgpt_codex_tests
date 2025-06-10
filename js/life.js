document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('life-board');
    const startBtn = document.getElementById('life-start');
    const statDisplays = {
        attack: document.getElementById('stat-attack'),
        defense: document.getElementById('stat-defense'),
        speed: document.getElementById('stat-speed')
    };
    const stats = {attack: 0, defense: 0, speed: 0};
    const maxStat = 5;
    const totalPoints = 10;
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

    function updateDisplays() {
        Object.keys(statDisplays).forEach(key => {
            const display = statDisplays[key];
            display.innerHTML = '';
            for (let i = 0; i < maxStat; i++) {
                const span = document.createElement('span');
                span.textContent = i < stats[key] ? '🔴' : '⚪';
                span.className = i < stats[key] ? 'filled' : 'empty';
                display.appendChild(span);
            }
        });
        const total = ['attack','defense','speed']
            .map(k => Number(stats[k]) || 0)
            .reduce((a,b) => a + b, 0);
        remainingSpan.textContent = totalPoints - total;
    }

    document.querySelectorAll('.stat-inc').forEach(btn => {
        btn.addEventListener('click', () => {
            const stat = btn.dataset.stat;
            const total = stats.attack + stats.defense + stats.speed;
            if (total < totalPoints && stats[stat] < maxStat) {
                stats[stat]++;
                updateDisplays();
            }
        });
    });

    document.querySelectorAll('.stat-dec').forEach(btn => {
        btn.addEventListener('click', () => {
            const stat = btn.dataset.stat;
            if (stats[stat] > 0) {
                stats[stat]--;
                updateDisplays();
            }
        });
    });

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
        const total = stats.attack + stats.defense + stats.speed;
        if (total > totalPoints) {
            alert('Za dużo punktów!');
            return;
        }
        clearInterval(timer);
        createBoard();
        microbes = [];
        const player = {
            x: Math.floor(Math.random() * size),
            y: Math.floor(Math.random() * size),
            attack: stats.attack,
            defense: stats.defense,
            speed: stats.speed,
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
    updateDisplays();
});
