const playerSettings = {
    name: 'Gracz',
    color: '#dc3545',
    emoji: '🐶',
    aiColor: '#ffc107',
    aiEmoji: '💻'
};

function loadPlayerSettings() {
    const raw = localStorage.getItem('playerSettings');
    if (raw) {
        try {
            const data = JSON.parse(raw);
            if (data.name) playerSettings.name = data.name;
            if (data.color) playerSettings.color = data.color;
            if (data.emoji) playerSettings.emoji = data.emoji;
            if (data.aiColor) playerSettings.aiColor = data.aiColor;
            if (data.aiEmoji) playerSettings.aiEmoji = data.aiEmoji;
        } catch {}
    }
}

function savePlayerSettings() {
    localStorage.setItem('playerSettings', JSON.stringify(playerSettings));
}

window.playerSettings = playerSettings;
window.loadPlayerSettings = loadPlayerSettings;
window.savePlayerSettings = savePlayerSettings;

loadPlayerSettings();
