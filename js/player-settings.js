const playerSettings = {
    name: 'Gracz',
    color: '#dc3545',
    emoji: '🐶'
};

function loadPlayerSettings() {
    const raw = localStorage.getItem('playerSettings');
    if (raw) {
        try {
            const data = JSON.parse(raw);
            if (data.name) playerSettings.name = data.name;
            if (data.color) playerSettings.color = data.color;
            if (data.emoji) playerSettings.emoji = data.emoji;
        } catch {}
    }
}

function savePlayerSettings() {
    localStorage.setItem('playerSettings', JSON.stringify(playerSettings));
}

loadPlayerSettings();
