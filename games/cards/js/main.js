import { createDeck, suits, ranks } from './deck.js';
import { dealHands } from './deal.js';
import { registerHandlers, hostGame, joinGame } from './network.js';

// execute after DOM is loaded
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

    function setupHandlers() {
        registerHandlers(dc, {
            onStart: async msg => {
                opponentName = msg.name;
                updateNames();
                myCards = msg.cards;
                await dealHands(deckDiv, handDiv, oppHandDiv, myCards, new Array(myCards.length).fill(''), true, false);
            },
            onName: msg => {
                opponentName = msg.name;
                updateNames();
            }
        });
    }

    async function startHost() {
        dc = await hostGame(qrDiv, qrText);
        if (!dc) return;
        setupHandlers();
        deck = createDeck();
        myCards = deck.splice(0, 4);
        const oppCards = deck.splice(0, 4);
        dc.send(JSON.stringify({ type: 'start', name: myName, cards: oppCards }));
        await dealHands(deckDiv, handDiv, oppHandDiv, myCards, new Array(oppCards.length).fill(''), true, false);
        updateNames();
    }

    async function startJoin() {
        dc = await joinGame(qrDiv, qrText);
        if (!dc) return;
        setupHandlers();
        dc.send(JSON.stringify({ type: 'name', name: myName }));
    }

    hostBtn.addEventListener('click', startHost);
    joinBtn.addEventListener('click', startJoin);
});
