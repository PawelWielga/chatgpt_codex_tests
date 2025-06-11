// New life game with hunger and food

document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('life-board');
    const startBtn = document.getElementById('life-start');
    const hungerBar = document.getElementById('hunger-bar');
    const timeSpan = document.getElementById('time-span');
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
    const cellSize = 20;

    let microbes = [];
    let foods = [];
    let timer = null;
    let player = null;
    let ticks = 0;

    const speciesEmojis = ['😺','🐶','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯'];
    const foodEmojis = ['🍎','🍌','🍇','🍒','🍓','🍑','🍍','🥝'];

    const diets = ["herbivore","carnivore","omnivore"];
    const appearanceSelect = document.getElementById("appearance-select");
    const dietSelect = document.getElementById("diet-select");
    speciesEmojis.forEach(e => {
        const opt = document.createElement("option");
        opt.value = e;
        opt.textContent = e;
        appearanceSelect.appendChild(opt);
    });
    const dietLabels = {
        herbivore: 'Roślinożerca',
        carnivore: 'Mięsożerca',
        omnivore: 'Wszystkożerca'
    };
    diets.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = dietLabels[d];
        dietSelect.appendChild(opt);
    });
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
        const st = {attack: 0, defense: 0, speed: 0};
        const keys = Object.keys(st);
        while (points > 0) {
            const k = keys[Math.floor(Math.random() * keys.length)];
            st[k]++;
            points--;
        }
        return st;
    }

    function createEntity(emoji) {
        const el = document.createElement('div');
        el.className = 'entity';
        el.textContent = emoji;
        board.appendChild(el);
        return el;
    }

    function spawnFood() {
        const positions = [];
        for (let y=0; y<size; y++) {
            for (let x=0; x<size; x++) {
                if (!microbes.some(m => m.x===x && m.y===y) &&
                    !foods.some(f => f.x===x && f.y===y)) {
                    positions.push({x,y});
                }
            }
        }
        if (positions.length === 0) return;
        const pos = positions[Math.floor(Math.random()*positions.length)];
        const emoji = foodEmojis[Math.floor(Math.random()*foodEmojis.length)];
        const el = createEntity(emoji);
        const food = {x: pos.x, y: pos.y, el};
        foods.push(food);
        el.style.transform = `translate(${pos.x*cellSize}px, ${pos.y*cellSize}px)`;
    }

    function drawEntities() {
        microbes.forEach(m => {
            m.el.style.transform = `translate(${m.x*cellSize}px, ${m.y*cellSize}px)`;
        });
        foods.forEach(f => {
            f.el.style.transform = `translate(${f.x*cellSize}px, ${f.y*cellSize}px)`;
        });
        if (player) {
            hungerBar.style.width = player.hunger + '%';
        }
    }

    function fight(a, b) {
        const aScore = a.attack + Math.random() * a.speed - b.defense;
        const bScore = b.attack + Math.random() * b.speed - a.defense;
        return aScore >= bScore ? b : a;
    }

    function nearestFood(m) {
        let best = null;
        let dist = Infinity;
        foods.forEach(f => {
            const d = Math.abs(f.x - m.x) + Math.abs(f.y - m.y);
            if (d < dist) { dist = d; best = f; }
        });
        return best;
    }

    function strongerNearby(m) {
        const score = m.attack + m.defense;
        for (const o of microbes) {
            if (o === m) continue;
            const d = Math.abs(o.x - m.x) + Math.abs(o.y - m.y);
            if (d <= 3 && o.attack + o.defense > score) {
                return o;
            }
        }
        return null;
    }
    function predatorNearby(m) {
        for (const o of microbes) {
            if (o === m) continue;
            const d = Math.abs(o.x - m.x) + Math.abs(o.y - m.y);
            if (d <= 3) {
                if ((o.diet === "carnivore" && m.diet !== "carnivore") ||
                    (o.diet === "omnivore" && m.diet === "herbivore")) {
                    return o;
                }
            }
        }
        return null;
    }

    function nearestPrey(m) {
        let best = null;
        let dist = Infinity;
        microbes.forEach(o => {
            if (o === m) return;
            if ((m.diet === "carnivore" && o.diet !== "carnivore") ||
                (m.diet === "omnivore" && o.diet === "herbivore")) {
                const d = Math.abs(o.x - m.x) + Math.abs(o.y - m.y);
                if (d < dist) { dist = d; best = o; }
            }
        });
        return best;
    }

    function moveMicrobe(m) {
        for (let s=0; s<m.speed; s++) {
            const predator = predatorNearby(m);
            if (predator) {
                if (predator.x > m.x && m.x > 0) m.x--;
                else if (predator.x < m.x && m.x < size-1) m.x++;
                if (predator.y > m.y && m.y > 0) m.y--;
                else if (predator.y < m.y && m.y < size-1) m.y++;
                continue;
            }
            const danger = strongerNearby(m);
            if (danger) {
                if (danger.x > m.x && m.x > 0) m.x--;
                else if (danger.x < m.x && m.x < size-1) m.x++;
                if (danger.y > m.y && m.y > 0) m.y--;
                else if (danger.y < m.y && m.y < size-1) m.y++;
                continue;
            }
            let target = null;
            if (m.diet !== "carnivore") {
                target = nearestFood(m);
            }
            if (!target && m.diet !== "herbivore") {
                const prey = nearestPrey(m);
                if (prey) {
                    if (prey.x > m.x && m.x < size-1) m.x++;
                    else if (prey.x < m.x && m.x > 0) m.x--;
                    if (prey.y > m.y && m.y < size-1) m.y++;
                    else if (prey.y < m.y && m.y > 0) m.y--;
                    continue;
                }
            }
            if (target) {
                if (target.x > m.x && m.x < size-1) m.x++;
                else if (target.x < m.x && m.x > 0) m.x--;
                if (target.y > m.y && m.y < size-1) m.y++;
                else if (target.y < m.y && m.y > 0) m.y--;
            } else {
                const dir = Math.floor(Math.random()*4);
                if (dir===0 && m.y>0) m.y--;
                if (dir===1 && m.y<size-1) m.y++;
                if (dir===2 && m.x>0) m.x--;
                if (dir===3 && m.x<size-1) m.x++;
            }
        }
    }
    function step() {
        ticks++;
        timeSpan.textContent = (ticks/2).toFixed(1);
        if (Math.random() < 0.1 && foods.length < 10) spawnFood();
        microbes.forEach(moveMicrobe);

        // decrease hunger and remove dead
        for (let i=microbes.length-1; i>=0; i--) {
            const m = microbes[i];
            m.hunger -= 1;
            if (m.hunger <= 0) {
                board.removeChild(m.el);
                microbes.splice(i,1);
                if (m.isPlayer) return endGame(false);
            }
        }

        // eat
        microbes.forEach(m => {
            for (let i=foods.length-1; i>=0; i--) {
                const f = foods[i];
                if (f.x === m.x && f.y === m.y) {
                    board.removeChild(f.el);
                    foods.splice(i,1);
                    m.hunger = Math.min(100, m.hunger + 40);
                    if (m.hunger > 80 && m.hasEaten) {
                        const child = {...m};
                        child.x = Math.max(0, Math.min(size-1, m.x+1));
                        child.y = Math.max(0, Math.min(size-1, m.y+1));
                        child.hunger = 60;
                        child.isPlayer = false;
                        child.el = createEntity(m.emoji);
                        microbes.push(child);
                        drawEntities();
                    }
                    m.hasEaten = true;
                }
            }
        });

        // fights
        for (let i=microbes.length-1; i>=0; i--) {
            for (let j=i-1; j>=0; j--) {
                if (microbes[i].x===microbes[j].x && microbes[i].y===microbes[j].y) {
                    const a = microbes[i];
                    const b = microbes[j];
                    const loser = fight(a, b);
                    const winner = loser === a ? b : a;
                    board.removeChild(loser.el);
                    microbes.splice(microbes.indexOf(loser),1);
                    if ((winner.diet === "carnivore") ||
                        (winner.diet === "omnivore" && loser.diet === "herbivore")) {
                        winner.hunger = Math.min(100, winner.hunger + 40);
                    }
                    if (loser.isPlayer) return endGame(false);
                    break;
                }
            }
        }

        drawEntities();
        if (microbes.length===1 && microbes[0].isPlayer) endGame(true);
    }

    function endGame(win) {
        clearInterval(timer);
        timer = null;
        setTimeout(() => {
            const time = (ticks/2).toFixed(1);
            if (win) {
                alert('Przetrwałeś! Czas: ' + time + ' s.');
            } else {
                alert('Twój organizm zginął po ' + time + ' s.');
            }
        }, 10);
    }

    function startGame() {
        const total = stats.attack + stats.defense + stats.speed;
        if (total > totalPoints) {
            alert('Za dużo punktów!');
            return;
        }
        clearInterval(timer);
        board.innerHTML = '';
        microbes = [];
        foods = [];
        ticks = 0;
        timeSpan.textContent = '0';

        player = {
            x: Math.floor(Math.random()*size),
            y: Math.floor(Math.random()*size),
            attack: stats.attack,
            defense: stats.defense,
            speed: Math.max(1, Math.ceil((stats.speed || 1)/2)),
            isPlayer: true,
            diet: dietSelect.value,
            hunger: 100,
            emoji: appearanceSelect.value,
            el: null,
            hasEaten: false
        };
        player.el = createEntity(player.emoji);
        microbes.push(player);

        for (let i=0; i<5; i++) {
            const s = randomStats();
            const m = {
                x: Math.floor(Math.random()*size),
                y: Math.floor(Math.random()*size),
                attack: s.attack,
                defense: s.defense,
                speed: Math.max(1, Math.ceil((s.speed || 1)/2)),
                isPlayer: false,
                diet: diets[Math.floor(Math.random()*diets.length)],
                hunger: 100,
                emoji: speciesEmojis[Math.floor(Math.random()*speciesEmojis.length)],
                el: null,
                hasEaten: false
            };
            m.el = createEntity(m.emoji);
            microbes.push(m);
        }
        for(let i=0;i<3;i++) spawnFood();
        drawEntities();
        timer = setInterval(step, 500);
    }

    startBtn.addEventListener('click', startGame);
    updateDisplays();
});
