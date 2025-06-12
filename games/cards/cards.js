document.addEventListener('DOMContentLoaded', () => {
    const deckEl = document.getElementById('deck');
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    let offset = 0;
    for (const suit of suits) {
        for (const rank of ranks) {
            const card = document.createElement('div');
            card.className = 'card';
            card.textContent = `${rank}${suit}`;
            card.style.transform = `translate(-50%, -50%) translateY(${-offset}px)`;
            offset += 2;
            deckEl.appendChild(card);
        }
    }
});
