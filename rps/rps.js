document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('#rps-choices button');
    const status = document.getElementById('rps-status');
    const scoreSpan = document.getElementById('rps-score');
    const compSpan = document.getElementById('rps-comp');
    const slot = document.getElementById('rps-slot');
    const resetBtn = document.getElementById('rps-reset');
    const playerLabel = document.getElementById('rps-player');
    loadPlayerSettings();
    if (playerLabel) {
        playerLabel.textContent = `${playerSettings.name} ${playerSettings.emoji}`;
    }
    let score = 0;
    let comp = 0;
    const choices = ['rock', 'paper', 'scissors'];
    const icons = {
        rock: '👊',
        paper: '✋',
        scissors: '✌️'
    };

    function determineWinner(choice, computer) {
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

    function play(choice) {
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.choice !== choice) {
                btn.classList.add('rps-hidden');
            }
        });

        status.textContent = '';
        let i = 0;
        const anim = setInterval(() => {
            slot.textContent = icons[choices[i % 3]];
            i++;
        }, 100);

        setTimeout(() => {
            clearInterval(anim);
            const computer = choices[Math.floor(Math.random() * 3)];
            slot.textContent = icons[computer];
            determineWinner(choice, computer);
            buttons.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('rps-hidden');
            });
        }, 1000);
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
        slot.textContent = '';
    });
});
