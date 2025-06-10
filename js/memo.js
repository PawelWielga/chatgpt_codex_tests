document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('memo-board');
    const resetBtn = document.getElementById('memo-reset');
    const symbols = ['🍎','🍌','🍇','🍒','🍋','🍓','🍊','🍉'];
    let firstCard = null;
    let lock = false;

    function init() {
        board.innerHTML = '';
        const deck = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
        deck.forEach(sym => {
            const btn = document.createElement('button');
            btn.className = 'memo-card';
            btn.dataset.sym = sym;
            btn.innerHTML = `<div class="memo-card-inner">` +
                            `<div class="memo-card-front">${sym}</div>` +
                            `<div class="memo-card-back"></div>` +
                            `</div>`;
            btn.addEventListener('click', () => handleClick(btn));
            board.appendChild(btn);
        });
        firstCard = null;
        lock = false;
    }

    function handleClick(btn) {
        if (lock || btn.dataset.matched === 'true' || btn === firstCard) return;
        btn.classList.add('flipped');
        if (!firstCard) {
            firstCard = btn;
            return;
        }
        lock = true;
        if (btn.dataset.sym === firstCard.dataset.sym) {
            btn.dataset.matched = 'true';
            firstCard.dataset.matched = 'true';
            setTimeout(() => {
                btn.classList.add('matched');
                firstCard.classList.add('matched');
                btn.disabled = true;
                firstCard.disabled = true;
                firstCard = null;
                lock = false;
                if ([...board.querySelectorAll('.memo-card')].every(b => b.dataset.matched === 'true')) {
                    setTimeout(() => alert('Wygrana!'), 300);
                }
            }, 600);
        } else {
            setTimeout(() => {
                btn.classList.remove('flipped');
                firstCard.classList.remove('flipped');
                firstCard = null;
                lock = false;
            }, 700);
        }
    }

    resetBtn.addEventListener('click', init);

    init();
});
