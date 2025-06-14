// Rock Paper Scissors with optional online multiplayer using CodeConnect

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('#rps-choices button');
    const status = document.getElementById('rps-status');
    const slot = document.getElementById('rps-slot');
    const resetBtn = document.getElementById('rps-reset');
    const hostBtn = document.getElementById('rps-host');
    const joinBtn = document.getElementById('rps-join');
    const qrContainer = document.getElementById('rps-qr-container');
    const qrText = document.getElementById('rps-qr-text');
    const namesHeading = document.getElementById('rps-names');
    const score1Span = document.getElementById('rps-score1');
    const score2Span = document.getElementById('rps-score2');

    loadPlayerSettings();

    let mode = 'local'; // 'local' or 'remote'
    let dc = null;
    let myName = playerSettings.name;
    let opponentName = 'Komputer';
    let myScore = 0;
    let oppScore = 0;
    let myChoice = null;
    let oppChoice = null;

    const choices = ['rock', 'paper', 'scissors'];
    const icons = { rock: '👊', paper: '✋', scissors: '✌️' };

    function updateNamesDisplay() {
        if (namesHeading) {
            namesHeading.textContent = `${myName} vs ${opponentName}`;
        }
    }

    function display(choice) {
        return choice === 'rock' ? 'kamień' : choice === 'paper' ? 'papier' : 'nożyce';
    }

    function determineWinner() {
        const mine = myChoice;
        const theirs = oppChoice;
        if (!mine || !theirs) return;
        if (mine === theirs) {
            status.textContent = `Remis! Obaj wybraliście ${display(mine)}`;
        } else if (
            (mine === 'rock' && theirs === 'scissors') ||
            (mine === 'paper' && theirs === 'rock') ||
            (mine === 'scissors' && theirs === 'paper')
        ) {
            myScore++;
            status.textContent = `Wygrana! ${display(mine)} bije ${display(theirs)}`;
        } else {
            oppScore++;
            status.textContent = `Przegrana! ${display(theirs)} bije ${display(mine)}`;
        }
        score1Span.textContent = myScore;
        score2Span.textContent = oppScore;
    }

    function resetRound() {
        myChoice = null;
        oppChoice = null;
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('rps-hidden');
        });
    }

    function checkRound() {
        if (myChoice && oppChoice) {
            slot.textContent = icons[oppChoice];
            determineWinner();
            setTimeout(resetRound, 300);
        }
    }

    function playLocal(choice) {
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.choice !== choice) btn.classList.add('rps-hidden');
        });

        status.textContent = '';
        let i = 0;
        const anim = setInterval(() => {
            slot.textContent = icons[choices[i % 3]];
            i++;
        }, 100);

        setTimeout(() => {
            clearInterval(anim);
            myChoice = choice;
            oppChoice = choices[Math.floor(Math.random() * 3)];
            slot.textContent = icons[oppChoice];
            determineWinner();
            resetRound();
        }, 1000);
    }

    function playRemote(choice) {
        if (myChoice) return; // already chosen this round
        myChoice = choice;
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.choice !== choice) btn.classList.add('rps-hidden');
        });
        status.textContent = 'Czekaj na ruch przeciwnika...';
        slot.textContent = '';
        if (dc) dc.send(JSON.stringify({ type: 'choice', choice }));
        checkRound();
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (mode === 'remote') playRemote(btn.dataset.choice);
            else playLocal(btn.dataset.choice);
        });
    });

    function handleReset(remote = false) {
        myScore = 0;
        oppScore = 0;
        score1Span.textContent = '0';
        score2Span.textContent = '0';
        status.textContent = '';
        slot.textContent = '';
        resetRound();
        if (mode === 'remote' && dc && !remote) {
            dc.send(JSON.stringify({ type: 'reset' }));
        }
    }

    resetBtn.addEventListener('click', () => handleReset());

    function setupDataChannel() {
        dc.on('data', data => {
            const msg = JSON.parse(data);
            if (msg.type === 'choice') {
                oppChoice = msg.choice;
                checkRound();
            } else if (msg.type === 'reset') {
                handleReset(true);
            } else if (msg.type === 'name') {
                opponentName = msg.name;
                updateNamesDisplay();
            }
        });
    }

    async function startHost() {
        mode = 'remote';
        qrContainer.style.display = 'block';
        const conn = await CodeConnect.host({ text: qrText });
        qrContainer.style.display = 'none';
        if (!conn) return;
        dc = conn.dc;
        setupDataChannel();
        dc.send(JSON.stringify({ type: 'name', name: myName }));
        updateNamesDisplay();
    }

    async function startJoin() {
        mode = 'remote';
        qrContainer.style.display = 'block';
        const conn = await CodeConnect.join({ text: qrText });
        qrContainer.style.display = 'none';
        if (!conn) return;
        dc = conn.dc;
        setupDataChannel();
        dc.send(JSON.stringify({ type: 'name', name: myName }));
        updateNamesDisplay();
    }

    if (hostBtn) hostBtn.addEventListener('click', startHost);
    if (joinBtn) joinBtn.addEventListener('click', startJoin);

    updateNamesDisplay();
}
