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

    const svgPath = 'M10 55 Q10 35 30 30 L40 10 L50 30 L60 10 L70 30 Q90 35 90 55 Q90 80 50 90 Q10 80 10 55 Z';

    buttons.forEach(val => {
        const btn = document.createElement('button');
        btn.innerHTML =
            `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="${svgPath}"/></svg>`+
            `<span>${val}</span>`;
        btn.dataset.value = val;
        btn.classList.add('cat-button');
        if ('/*-+=C'.includes(val)) {
            btn.classList.add('operator');
        }
        grid.appendChild(btn);
    });

    grid.addEventListener('click', e => {
        const target = e.target.closest('button');
        if (!target) return;
        const value = target.dataset.value;
        if (value === 'C') {
            display.value = '';
        } else if (value === '=') {
            try {
                const result = eval(display.value);
                if (typeof result === 'number') {
                    display.value = parseFloat(result.toFixed(10));
                } else {
                    display.value = result;
                }
            } catch {
                display.value = 'Error';
            }
        } else {
            display.value += value;
        }
    });
});
