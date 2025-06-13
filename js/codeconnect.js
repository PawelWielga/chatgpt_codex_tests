const CodeConnect = (() => {
    function randomCode(len = 5) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < len; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    async function host(elems) {
        const { text } = elems;
        const code = randomCode();
        const peer = new Peer(code);
        text.textContent = `Kod: ${code}. Czekaj na gracza...`;
        return new Promise(resolve => {
            peer.on('connection', conn => {
                conn.on('open', () => {
                    text.textContent = '';
                    resolve({ peer, dc: conn });
                });
            });
        });
    }

    async function join(elems) {
        const { text } = elems;
        const code = prompt('Podaj kod hosta');
        if (!code) return null;
        text.textContent = 'Łączenie...';
        const peer = new Peer();
        return new Promise(resolve => {
            peer.on('open', () => {
                const conn = peer.connect(code);
                conn.on('open', () => {
                    text.textContent = '';
                    resolve({ peer, dc: conn });
                });
            });
        });
    }

    return { host, join };
})();

window.CodeConnect = CodeConnect;
