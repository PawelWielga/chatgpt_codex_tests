// Advanced organism simulation

declare const playerSettings: any;
declare function loadPlayerSettings(): void;

export function initLife() {
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
    const maxFood = 20;
    const baseLifespan = 150;
    const reproductionEnergy = 80;
    const energyGainFromFood = 40;
    const moveCost = 0.5;

    const terrains = ['water','desert','meadow','forest','mountain'];
    const terrainMoveCost = {
        water: moveCost,
        desert: moveCost * 2,
        meadow: moveCost,
        forest: moveCost * 1.5,
        mountain: moveCost * 2
    };

    let terrainGrid = [];
    let terrainLayer = null;
    let entityLayer = null;

    let microbes = [];
    let foods = [];
    let timer = null;
    let player = null;
    let ticks = 0;

    createLayers();
    generateTerrain();
    renderTerrain();

    const speciesData = [
        {emoji:'😺', movement:'land'},
        {emoji:'🐶', movement:'land'},
        {emoji:'🐭', movement:'land'},
        {emoji:'🐹', movement:'land'},
        {emoji:'🐰', movement:'land'},
        {emoji:'🦊', movement:'land'},
        {emoji:'🐻', movement:'land'},
        {emoji:'🐼', movement:'land'},
        {emoji:'🐨', movement:'land'},
        {emoji:'🐯', movement:'land'},
        {emoji:'🐟', movement:'water'},
        {emoji:'🐠', movement:'water'},
        {emoji:'🐡', movement:'water'},
        {emoji:'🦈', movement:'water'},
        {emoji:'🐸', movement:'both'},
        {emoji:'🦆', movement:'both'}
    ];
    const foodEmojis = ['🍎','🍌','🍇','🍒','🍓','🍑','🍍','🥝'];
    const waterFoodEmojis = ['🐟','🦐','🦀','🦑'];

    const diets = ["herbivore","carnivore","omnivore"];
    const appearanceSelect = document.getElementById("appearance-select") as HTMLSelectElement;
    const dietSelect = document.getElementById("diet-select") as HTMLSelectElement;
    const movementSelect = document.getElementById("movement-select") as HTMLSelectElement;
    const movementTypes = ['land','water','both'];
    const movementLabels = { land: 'Ląd', water: 'Woda', both: 'Ląd i woda' };

    speciesData.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.emoji;
        opt.textContent = s.emoji;
        opt.dataset.movement = s.movement;
        appearanceSelect.appendChild(opt);
    });
    appearanceSelect.addEventListener('change', () => {
        const sel = speciesData.find(s => s.emoji === appearanceSelect.value);
        if (sel) movementSelect.value = sel.movement;
    });
    movementTypes.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = movementLabels[t];
        movementSelect.appendChild(opt);
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
        remainingSpan.textContent = String(totalPoints - total);
    }

    (document.querySelectorAll('.stat-inc') as NodeListOf<HTMLButtonElement>).forEach(btn => {
        btn.addEventListener('click', () => {
            const stat = btn.dataset.stat;
            const total = stats.attack + stats.defense + stats.speed;
            if (total < totalPoints && stats[stat] < maxStat) {
                stats[stat]++;
                updateDisplays();
            }
        });
    });

    (document.querySelectorAll('.stat-dec') as NodeListOf<HTMLButtonElement>).forEach(btn => {
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

    function createLayers() {
        terrainLayer = document.createElement('div');
        terrainLayer.id = 'terrain-layer';
        terrainLayer.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
        terrainLayer.style.gridTemplateRows = `repeat(${size}, ${cellSize}px)`;
        board.appendChild(terrainLayer);

        entityLayer = document.createElement('div');
        entityLayer.id = 'entity-layer';
        board.appendChild(entityLayer);
    }

    function generateTerrain() {
        terrainGrid = [];
        for (let y=0; y<size; y++) {
            const row = [];
            for (let x=0; x<size; x++) {
                const r = Math.random();
                let t;
                if (r < 0.1) t = 'water';
                else if (r < 0.25) t = 'desert';
                else if (r < 0.6) t = 'meadow';
                else if (r < 0.85) t = 'forest';
                else t = 'mountain';
                row.push(t);
            }
            terrainGrid.push(row);
        }
        const cx = Math.floor(size/2);
        const cy = Math.floor(size/2);
        for (let y=cy-2; y<=cy+2; y++) {
            for (let x=cx-2; x<=cx+2; x++) {
                if (y>=0 && y<size && x>=0 && x<size) {
                    terrainGrid[y][x] = 'water';
                }
            }
        }
    }

    function renderTerrain() {
        terrainLayer.innerHTML = '';
        for (let y=0; y<size; y++) {
            for (let x=0; x<size; x++) {
                const cell = document.createElement('div');
                cell.className = `terrain-cell ${terrainGrid[y][x]}`;
                terrainLayer.appendChild(cell);
            }
        }
    }

    function randomCellFor(movement) {
        let x, y, valid;
        do {
            x = Math.floor(Math.random()*size);
            y = Math.floor(Math.random()*size);
            const terrain = terrainGrid[y][x];
            if (movement === 'water') valid = terrain === 'water';
            else if (movement === 'land') valid = terrain !== 'water';
            else valid = true;
        } while (!valid);
        return {x, y};
    }

    function createEntity(emoji) {
        const el = document.createElement('div');
        el.className = 'entity';
        el.textContent = emoji;
        entityLayer.appendChild(el);
        return el;
    }

    function spawnFood() {
        const isWater = Math.random() < 0.3;
        const positions = [];
        for (let y=0; y<size; y++) {
            for (let x=0; x<size; x++) {
                if ((isWater ? terrainGrid[y][x] === 'water' : terrainGrid[y][x] !== 'water') &&
                    !microbes.some(m => m.x===x && m.y===y) &&
                    !foods.some(f => f.x===x && f.y===y)) {
                    positions.push({x,y});
                }
            }
        }
        if (positions.length === 0) return;
        const pos = positions[Math.floor(Math.random()*positions.length)];
        const emoji = isWater ?
            waterFoodEmojis[Math.floor(Math.random()*waterFoodEmojis.length)] :
            foodEmojis[Math.floor(Math.random()*foodEmojis.length)];
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
            const terrain = terrainGrid[f.y][f.x];
            if (m.movement === 'land' && terrain === 'water') return;
            if (m.movement === 'water' && terrain !== 'water') return;
            const d = Math.abs(f.x - m.x) + Math.abs(f.y - m.y);
            if (d < dist) { dist = d; best = f; }
        });
        return best;
    }

    function strongerNearby(m) {
        const score = m.attack + m.defense;
        for (const o of microbes) {
            if (o === m) continue;
            const terrain = terrainGrid[o.y][o.x];
            if (m.movement === 'land' && terrain === 'water') continue;
            if (m.movement === 'water' && terrain !== 'water') continue;
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
            const terrain = terrainGrid[o.y][o.x];
            if (m.movement === 'land' && terrain === 'water') continue;
            if (m.movement === 'water' && terrain !== 'water') continue;
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
                const terrain = terrainGrid[o.y][o.x];
                if (m.movement === 'land' && terrain === 'water') return;
                if (m.movement === 'water' && terrain !== 'water') return;
                const d = Math.abs(o.x - m.x) + Math.abs(o.y - m.y);
                if (d < dist) { dist = d; best = o; }
            }
        });
        return best;
    }

    function moveRelative(m, dx, dy) {
        const nx = m.x + dx;
        const ny = m.y + dy;
        if (nx < 0 || nx >= size || ny < 0 || ny >= size) return;
        const terrain = terrainGrid[ny][nx];
        if (terrain === 'water' && m.movement === 'land') return;
        if (terrain !== 'water' && m.movement === 'water') return;
        m.x = nx;
        m.y = ny;
        m.hunger -= terrainMoveCost[terrain] || moveCost;
    }

    function moveMicrobe(m) {
        for (let s=0; s<m.speed; s++) {
            const predator = predatorNearby(m);
            if (predator) {
                if (predator.x > m.x) moveRelative(m, -1, 0);
                else if (predator.x < m.x) moveRelative(m, 1, 0);
                if (predator.y > m.y) moveRelative(m, 0, -1);
                else if (predator.y < m.y) moveRelative(m, 0, 1);
                continue;
            }
            const danger = strongerNearby(m);
            if (danger) {
                if (danger.x > m.x) moveRelative(m, -1, 0);
                else if (danger.x < m.x) moveRelative(m, 1, 0);
                if (danger.y > m.y) moveRelative(m, 0, -1);
                else if (danger.y < m.y) moveRelative(m, 0, 1);
                continue;
            }
            let target = null;
            if (m.diet !== "carnivore") {
                target = nearestFood(m);
            }
            if (!target && m.diet !== "herbivore") {
                const prey = nearestPrey(m);
                if (prey) {
                    if (prey.x > m.x) moveRelative(m, 1, 0);
                    else if (prey.x < m.x) moveRelative(m, -1, 0);
                    if (prey.y > m.y) moveRelative(m, 0, 1);
                    else if (prey.y < m.y) moveRelative(m, 0, -1);
                    continue;
                }
            }
            if (target) {
                if (target.x > m.x) moveRelative(m, 1, 0);
                else if (target.x < m.x) moveRelative(m, -1, 0);
                if (target.y > m.y) moveRelative(m, 0, 1);
                else if (target.y < m.y) moveRelative(m, 0, -1);
            } else {
                const dir = Math.floor(Math.random()*4);
                if (dir===0) moveRelative(m, 0, -1);
                if (dir===1) moveRelative(m, 0, 1);
                if (dir===2) moveRelative(m, -1, 0);
                if (dir===3) moveRelative(m, 1, 0);
            }
        }
    }
    function step() {
        ticks++;
        timeSpan.textContent = (ticks/2).toFixed(1);
        if (Math.random() < 0.1 && foods.length < maxFood) spawnFood();
        microbes.forEach(moveMicrobe);

        // decrease hunger, age and remove dead
        for (let i=microbes.length-1; i>=0; i--) {
            const m = microbes[i];
            m.hunger -= 1;
            m.age += 1;
            if (m.hunger <= 0 || m.age > m.lifespan) {
                entityLayer.removeChild(m.el);
                microbes.splice(i,1);
                if (m.isPlayer) return endGame(false);
            }
        }

        // eat
        microbes.forEach(m => {
            for (let i=foods.length-1; i>=0; i--) {
                const f = foods[i];
                if (f.x === m.x && f.y === m.y) {
                    entityLayer.removeChild(f.el);
                    foods.splice(i,1);
                    m.hunger = Math.min(100, m.hunger + energyGainFromFood);
                    if (m.hunger > reproductionEnergy && Math.random() < 0.2) {
                        const child = {...m};
                        let cx, cy;
                        for (let t=0; t<10; t++) {
                            const nx = Math.max(0, Math.min(size-1, m.x + (Math.floor(Math.random()*3)-1)));
                            const ny = Math.max(0, Math.min(size-1, m.y + (Math.floor(Math.random()*3)-1)));
                            const terrain = terrainGrid[ny][nx];
                            const valid = (m.movement === 'land' && terrain !== 'water') ||
                                          (m.movement === 'water' && terrain === 'water') ||
                                          (m.movement === 'both');
                            if (valid && !microbes.some(o=>o.x===nx && o.y===ny)) {
                                cx = nx; cy = ny; break;
                            }
                        }
                        if (cx === undefined) {
                            const pos = randomCellFor(m.movement);
                            cx = pos.x; cy = pos.y;
                        }
                        child.x = cx;
                        child.y = cy;
                        child.hunger = m.hunger / 2;
                        m.hunger = m.hunger / 2;
                        child.age = 0;
                        child.lifespan = m.lifespan + (Math.random()*20-10);
                        child.isPlayer = false;
                        child.movement = m.movement;
                        child.el = createEntity(m.emoji);
                        microbes.push(child);
                        drawEntities();
                    }
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
                    entityLayer.removeChild(loser.el);
                    microbes.splice(microbes.indexOf(loser),1);
                    if ((winner.diet === "carnivore") ||
                        (winner.diet === "omnivore" && loser.diet === "herbivore")) {
                        winner.hunger = Math.min(100, winner.hunger + energyGainFromFood);
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
        createLayers();
        generateTerrain();
        renderTerrain();

        const startPos = randomCellFor(movementSelect.value);
        player = {
            x: startPos.x,
            y: startPos.y,
            attack: stats.attack,
            defense: stats.defense,
            speed: Math.max(1, Math.ceil((stats.speed || 1)/2)),
            isPlayer: true,
            diet: dietSelect.value,
            hunger: 100,
            emoji: appearanceSelect.value,
            movement: movementSelect.value,
            el: null,
            age: 0,
            lifespan: baseLifespan + Math.random()*50
        };
        player.el = createEntity(player.emoji);
        microbes.push(player);

        for (let i=0; i<5; i++) {
            const s = randomStats();
            const species = speciesData[Math.floor(Math.random()*speciesData.length)];
            const pos = randomCellFor(species.movement);
            const m = {
                x: pos.x,
                y: pos.y,
                attack: s.attack,
                defense: s.defense,
                speed: Math.max(1, Math.ceil((s.speed || 1)/2)),
                isPlayer: false,
                diet: diets[Math.floor(Math.random()*diets.length)],
                hunger: 100,
                emoji: species.emoji,
                movement: species.movement,
                el: null,
                age: 0,
                lifespan: baseLifespan + Math.random()*50
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
}
