document.addEventListener('DOMContentLoaded', () => {
    const hostBtn = document.getElementById('hp-host');
    const joinBtn = document.getElementById('hp-join');
    const startBtn = document.getElementById('hp-start');
    const passBtn = document.getElementById('hp-pass');
    const codeP = document.getElementById('hp-code');
    const qrDiv = document.getElementById('hp-qr');
    const namesP = document.getElementById('hp-names');
    const statusP = document.getElementById('hp-status');
    const timerP = document.getElementById('hp-timer');

    loadPlayerSettings();

    let peer = null;
    let isHost = false;
    let myId = null;
    let myName = playerSettings.name;
    const connections = {}; // peerId -> DataConnection
    const players = {}; // peerId -> {name}
    let holderId = null;
    let timeLeft = 0;
    let tickInterval = null;

    function randomCode(len = 5) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < len; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    function broadcast(msg) {
        Object.values(connections).forEach(c => c.send(JSON.stringify(msg)));
    }

    function updateNames() {
        namesP.textContent = 'Gracze: ' + Object.values(players).map(p => p.name).join(', ');
    }

    function updateUI() {
        updateNames();
        if (holderId) {
            statusP.textContent = 'Ziemniaka ma: ' + players[holderId].name;
        } else {
            statusP.textContent = '';
        }
        passBtn.style.display = holderId === myId ? 'inline-block' : 'none';
        startBtn.style.display = isHost && Object.keys(players).length > 1 && !holderId ? 'inline-block' : 'none';
    }

    function startTimer() {
        clearInterval(tickInterval);
        timeLeft = 8;
        timerP.textContent = timeLeft;
        tickInterval = setInterval(() => {
            timeLeft--;
            timerP.textContent = timeLeft;
            broadcast({type:'tick', time: timeLeft});
            if (timeLeft <= 0) {
                clearInterval(tickInterval);
                statusP.textContent = players[holderId].name + ' przegrywa!';
                broadcast({type:'end', loser: holderId});
                passBtn.style.display = 'none';
                holderId = null;
                startBtn.style.display = isHost ? 'inline-block' : 'none';
            }
        }, 1000);
    }

    function chooseNextHolder(excludeId) {
        const ids = Object.keys(players).filter(id => id !== excludeId);
        if (ids.length === 0) return null;
        return ids[Math.floor(Math.random() * ids.length)];
    }

    function setHolder(id) {
        holderId = id;
        broadcast({type:'holder', holder: holderId});
        startTimer();
        updateUI();
    }

    function handlePass(fromId) {
        if (fromId !== holderId) return;
        const next = chooseNextHolder(fromId);
        if (next) setHolder(next);
    }

    function handleData(conn, msg) {
        if (msg.type === 'join') {
            players[conn.peer] = {name: msg.name};
            updateNames();
            broadcast({type:'players', players});
            conn.send(JSON.stringify({type:'init', id: conn.peer, players, holder: holderId, time: timeLeft}));
            updateUI();
        } else if (msg.type === 'pass') {
            handlePass(conn.peer);
        }
    }

    function setupConnection(conn) {
        connections[conn.peer] = conn;
        conn.on('data', data => {
            let msg = null;
            try { msg = JSON.parse(data); } catch {}
            if (!msg) return;
            if (isHost) handleData(conn, msg);
            else handleClientMessage(msg);
        });
        conn.on('close', () => {
            delete connections[conn.peer];
            delete players[conn.peer];
            if (holderId === conn.peer) {
                holderId = chooseNextHolder(conn.peer);
                if (holderId) setHolder(holderId);
            }
            updateUI();
        });
    }

    hostBtn.addEventListener('click', () => {
        isHost = true;
        const code = randomCode();
        peer = new Peer(code);
        qrDiv.style.display = 'block';
        codeP.textContent = 'Kod: ' + code + '. Oczekiwanie na graczy...';
        peer.on('open', id => {
            myId = id;
            players[myId] = {name: myName};
            updateUI();
        });
        peer.on('connection', conn => {
            setupConnection(conn);
        });
    });

    joinBtn.addEventListener('click', () => {
        const code = prompt('Podaj kod hosta');
        if (!code) return;
        peer = new Peer();
        qrDiv.style.display = 'block';
        codeP.textContent = 'Łączenie...';
        peer.on('open', id => {
            myId = id;
            const conn = peer.connect(code);
            setupConnection(conn);
            conn.on('open', () => {
                conn.send(JSON.stringify({type:'join', name: myName}));
                qrDiv.style.display = 'none';
            });
        });
    });

    startBtn.addEventListener('click', () => {
        if (!isHost || Object.keys(players).length < 2) return;
        setHolder(chooseNextHolder(null));
    });

    passBtn.addEventListener('click', () => {
        if (isHost) handlePass(myId);
        else {
            const conn = Object.values(connections).find(c => c.peer === peer.id ? false : true) || Object.values(connections)[0];
            if (conn) conn.send(JSON.stringify({type:'pass'}));
        }
    });

    // client message handling
    function handleClientMessage(msg) {
        if (msg.type === 'players') {
            Object.assign(players, msg.players);
            updateUI();
        } else if (msg.type === 'init') {
            Object.assign(players, msg.players);
            holderId = msg.holder;
            timeLeft = msg.time;
            updateUI();
            if (holderId) timerP.textContent = timeLeft;
        } else if (msg.type === 'holder') {
            holderId = msg.holder;
            timeLeft = 8;
            timerP.textContent = timeLeft;
            updateUI();
        } else if (msg.type === 'tick') {
            timeLeft = msg.time;
            timerP.textContent = timeLeft;
        } else if (msg.type === 'end') {
            statusP.textContent = players[msg.loser].name + ' przegrywa!';
            holderId = null;
            passBtn.style.display = 'none';
        }
    }
});
