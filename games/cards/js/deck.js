export const suits = ['\u2660','\u2665','\u2666','\u2663'];
export const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

export function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

export function createDeck() {
    const deck = [];
    for (const s of suits) {
        for (const r of ranks) {
            deck.push(`${r}${s}`);
        }
    }
    shuffle(deck);
    return deck;
}
