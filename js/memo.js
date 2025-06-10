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
            btn.className = 'btn btn-light';
            btn.dataset.sym = sym;
            btn.addEventListener('click', () => handleClick(btn));
            board.appendChild(btn);
        });
        firstCard = null;
        lock = false;
    }

    function handleClick(btn) {
        if (lock || btn.disabled || btn === firstCard) return;
        btn.textContent = btn.dataset.sym;
        if (!firstCard) {
            firstCard = btn;
            return;
        }
        lock = true;
        if (btn.dataset.sym === firstCard.dataset.sym) {
            btn.disabled = true;
            firstCard.disabled = true;
            firstCard = null;
            lock = false;
            if ([...board.children].every(b => b.disabled)) {
                setTimeout(() => alert('Wygrana!'), 300);
            }
        } else {
            setTimeout(() => {
                btn.textContent = '';
                firstCard.textContent = '';
                firstCard = null;
                lock = false;
            }, 700);
        }
    }

    resetBtn.addEventListener('click', init);

    init();
});
