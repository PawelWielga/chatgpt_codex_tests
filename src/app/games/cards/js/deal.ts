export function dealCard(deckDiv, card, target, faceUp) {
    return new Promise<void>(resolve => {
        const tableRect = deckDiv.parentElement.getBoundingClientRect();
        const deckRect = deckDiv.getBoundingClientRect();

        const startWidth = target.offsetWidth;
        target.style.width = startWidth + 'px';

        const placeholder = document.createElement('div');
        placeholder.className = 'playing-card placeholder';
        if (!faceUp) placeholder.classList.add('back');
        target.appendChild(placeholder);

        const endWidth = target.scrollWidth;

        // Calculate the final card position without waiting for the width
        // transition to finish. Temporarily disable the transition so the
        // layout reflects the final width and we can measure the correct
        // bounding box.
        const originalTransition = target.style.transition;
        target.style.transition = 'none';
        target.style.width = endWidth + 'px';
        const targetRect = placeholder.getBoundingClientRect();
        target.style.width = startWidth + 'px';
        target.style.transition = originalTransition;

        const temp = document.createElement('div');
        temp.className = 'deal-card';
        if (!faceUp) temp.classList.add('back');
        temp.textContent = faceUp ? card : '';
        temp.style.left = (deckRect.left - tableRect.left) + 'px';
        temp.style.top = (deckRect.top - tableRect.top) + 'px';
        deckDiv.parentElement.appendChild(temp);

        requestAnimationFrame(() => {
            target.style.width = endWidth + 'px';
            temp.style.transform = `translate(${targetRect.left - deckRect.left}px, ${targetRect.top - deckRect.top}px)`;
        });

        const timer = setTimeout(() => handler(), 700);
        temp.addEventListener('transitionend', handler, { once: true });
        function handler() {
            clearTimeout(timer);
            placeholder.textContent = faceUp ? card : '';
            if (faceUp) placeholder.classList.remove('back');
            // Ensure the dealt card becomes visible once it reaches the hand
            placeholder.style.visibility = 'visible';
            temp.remove();
            target.style.width = '';
            resolve();
        }
    });
}

export async function dealHands(deckDiv, handDiv, oppHandDiv, myCards, oppCards, myFaceUp = true, oppFaceUp = false) {
    const maxLen = Math.max(myCards.length, oppCards.length);
    for (let i = 0; i < maxLen; i++) {
        if (i < myCards.length) {
            await dealCard(deckDiv, myCards[i], handDiv, myFaceUp);
        }
        if (i < oppCards.length) {
            await dealCard(deckDiv, oppCards[i], oppHandDiv, oppFaceUp);
        }
    }
}
