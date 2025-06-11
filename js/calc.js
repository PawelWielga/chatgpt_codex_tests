document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('calc-display');
    const grid = document.getElementById('calc-buttons');

    const buttons = [
        '7','8','9','/',
        '4','5','6','*',
        '1','2','3','-',
        '0','.','=','+',
        'C'
    ];

    buttons.forEach(val => {
        const btn = document.createElement('button');
        btn.textContent = val;
        btn.dataset.value = val;
        btn.classList.add('cat-button');
        if ('/*-+=C'.includes(val)) {
            btn.classList.add('operator');
        }
        grid.appendChild(btn);
    });

    grid.addEventListener('click', e => {
        if (e.target.tagName !== 'BUTTON') return;
        const value = e.target.dataset.value;
        if (value === 'C') {
            display.value = '';
        } else if (value === '=') {
            try {
                display.value = eval(display.value);
            } catch {
                display.value = 'Error';
            }
        } else {
            display.value += value;
        }
    });
});
