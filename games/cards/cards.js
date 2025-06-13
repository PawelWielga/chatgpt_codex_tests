document.addEventListener('DOMContentLoaded', () => {
    const deckDiv = document.getElementById('deck');
    const handDiv = document.getElementById('my-hand');
    const oppHandDiv = document.getElementById('opp-hand');
    const hostBtn = document.getElementById('cg-host');
    const joinBtn = document.getElementById('cg-join');
    const qrDiv = document.getElementById('cg-qr');
    const qrText = document.getElementById('cg-code');
    const namesHeading = document.getElementById('cg-names');

    loadPlayerSettings();

    const suits = ['♠','♥','♦','♣'];
    const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

    // Show deck stacked in 3D
    let offset = 0;
    for (const s of suits) {
        for (const r of ranks) {
            const card = document.createElement('div');
            card.className = 'card back';
            card.textContent = '';
            card.style.left = '50%';
            card.style.top = '50%';
            card.style.transform = `translate(-50%, -50%) translateY(${-offset}px)`;
            offset += 1;
            deckDiv.appendChild(card);
        }
    }

    let deck = [];
    let myCards = [];
    let dc = null;
    let myName = playerSettings.name;
    let opponentName = 'Przeciwnik';

    function updateNames() {
        if (namesHeading) {
            namesHeading.textContent = `${myName} vs ${opponentName}`;
            namesHeading.style.display = 'block';
        }
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    function createDeck() {
        deck = [];
        for (const s of suits) {
            for (const r of ranks) {
                deck.push(`${r}${s}`);
            }
        }
        shuffle(deck);
    }

    function createCard(text, back = false) {
        const c = document.createElement('div');
        c.className = 'card';
        if (back) c.classList.add('back');
        c.textContent = text;
        return c;
    }


    function dealAnimation(cards, target = handDiv, faceUp = true) {

        let offset = 0;
        const tableRect = deckDiv.parentElement.getBoundingClientRect();
        const deckRect = deckDiv.getBoundingClientRect();
        cards.forEach(card => {
            const temp = document.createElement('div');
            temp.className = 'deal-card';

            if (!faceUp) temp.classList.add('back');
            temp.textContent = faceUp ? card : '';
            temp.style.left = (deckRect.left - tableRect.left) + 'px';
            temp.style.top = (deckRect.top - tableRect.top) + 'px';
            deckDiv.parentElement.appendChild(temp);
            const targetX = target.offsetLeft + offset;
            const targetY = target.offsetTop;

            requestAnimationFrame(() => {
                temp.style.transform = `translate(${targetX - (deckRect.left - tableRect.left)}px, ${targetY - (deckRect.top - tableRect.top)}px)`;
            });
            temp.addEventListener('transitionend', () => {

                target.appendChild(createCard(faceUp ? card : '', !faceUp));

                temp.remove();
            }, { once: true });
            offset += 70;
        });
    }

    function setupDC() {
        dc.on('data', data => {
            const msg = JSON.parse(data);
            if (msg.type === 'start') {
                opponentName = msg.name;
                updateNames();
                myCards = msg.cards;

                dealAnimation(myCards, handDiv, true);
                dealAnimation(new Array(myCards.length).fill(''), oppHandDiv, false);

            } else if (msg.type === 'name') {
                opponentName = msg.name;
                updateNames();
            }
        });
    }

    async function startHost() {
        qrDiv.style.display = 'block';
        const conn = await CodeConnect.host({ text: qrText });
        qrDiv.style.display = 'none';
        if (!conn) return;
        dc = conn.dc;
        setupDC();
        createDeck();
        myCards = deck.splice(0, 4);
        const oppCards = deck.splice(0, 4);
        dc.send(JSON.stringify({ type: 'start', name: myName, cards: oppCards }));

        dealAnimation(myCards, handDiv, true);
        dealAnimation(new Array(oppCards.length).fill(''), oppHandDiv, false);

        updateNames();
    }

    async function startJoin() {
        qrDiv.style.display = 'block';
        const conn = await CodeConnect.join({ text: qrText });
        qrDiv.style.display = 'none';
        if (!conn) return;
        dc = conn.dc;
        setupDC();
        dc.send(JSON.stringify({ type: 'name', name: myName }));
    }

    hostBtn.addEventListener('click', startHost);
    joinBtn.addEventListener('click', startJoin);
});
