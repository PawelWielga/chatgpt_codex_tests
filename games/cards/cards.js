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

    // Show deck stacked in 3D with backs facing up
    let offset = 0;
    for (const s of suits) {
        for (const r of ranks) {
            const card = document.createElement('div');
            card.className = 'playing-card back';
            card.textContent = '';
            card.style.left = '50%';
            card.style.top = '50%';
            card.style.transform = `translate(-50%, -50%) translateY(${-offset}px)`;
            offset += 2;
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
        c.className = 'playing-card';
        if (back) c.classList.add('back');
        c.textContent = text;
        return c;
    }


    function dealCard(card, target, faceUp) {
        return new Promise(resolve => {
            const tableRect = deckDiv.parentElement.getBoundingClientRect();
            const deckRect = deckDiv.getBoundingClientRect();

            const startWidth = target.offsetWidth;
            target.style.width = startWidth + 'px';

            const placeholder = document.createElement('div');
            placeholder.className = 'playing-card placeholder';
            if (!faceUp) placeholder.classList.add('back');
            target.appendChild(placeholder);

            const endWidth = target.scrollWidth;

            const temp = document.createElement('div');
            temp.className = 'deal-card';
            if (!faceUp) temp.classList.add('back');
            temp.textContent = faceUp ? card : '';
            temp.style.left = (deckRect.left - tableRect.left) + 'px';
            temp.style.top = (deckRect.top - tableRect.top) + 'px';
            deckDiv.parentElement.appendChild(temp);

            requestAnimationFrame(() => {
                target.style.width = endWidth + 'px';
                const targetRect = placeholder.getBoundingClientRect();
                temp.style.transform = `translate(${targetRect.left - deckRect.left}px, ${targetRect.top - deckRect.top}px)`;
            });

            temp.addEventListener('transitionend', () => {
                placeholder.textContent = faceUp ? card : '';
                if (faceUp) placeholder.classList.remove('back');
                placeholder.style.visibility = '';
                temp.remove();
                target.style.width = '';
                resolve();
            }, { once: true });
        });
    }

    async function dealHands(myCards, oppCards, myFaceUp = true, oppFaceUp = false) {
        const maxLen = Math.max(myCards.length, oppCards.length);
        for (let i = 0; i < maxLen; i++) {
            if (i < myCards.length) {
                await dealCard(myCards[i], handDiv, myFaceUp);
            }
            if (i < oppCards.length) {
                await dealCard(oppCards[i], oppHandDiv, oppFaceUp);
            }
        }
    }

    function setupDC() {
        dc.on('data', async data => {
            const msg = JSON.parse(data);
            if (msg.type === 'start') {
                opponentName = msg.name;
                updateNames();
                myCards = msg.cards;

                await dealHands(myCards, new Array(myCards.length).fill(''), true, false);

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

        await dealHands(myCards, new Array(oppCards.length).fill(''), true, false);

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
