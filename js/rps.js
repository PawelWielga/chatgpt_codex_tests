document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('#rps-choices button');
    const status = document.getElementById('rps-status');
    const scoreSpan = document.getElementById('rps-score');
    const compSpan = document.getElementById('rps-comp');
    const resetBtn = document.getElementById('rps-reset');
    let score = 0;
    let comp = 0;
    const choices = ['rock', 'paper', 'scissors'];

    function play(choice) {
        const computer = choices[Math.floor(Math.random() * 3)];
        if (choice === computer) {
            status.textContent = `Remis! Obaj wybraliście ${display(choice)}`;
        } else if (
            (choice === 'rock' && computer === 'scissors') ||
            (choice === 'paper' && computer === 'rock') ||
            (choice === 'scissors' && computer === 'paper')
        ) {
            score++;
            status.textContent = `Wygrana! ${display(choice)} bije ${display(computer)}`;
        } else {
            comp++;
            status.textContent = `Przegrana! ${display(computer)} bije ${display(choice)}`;
        }
        scoreSpan.textContent = score;
        compSpan.textContent = comp;
    }

    function display(choice) {
        return choice === 'rock' ? 'kamień' : choice === 'paper' ? 'papier' : 'nożyce';
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => play(btn.dataset.choice));
    });

    resetBtn.addEventListener('click', () => {
        score = 0;
        comp = 0;
        scoreSpan.textContent = '0';
        compSpan.textContent = '0';
        status.textContent = '';
    });
});
