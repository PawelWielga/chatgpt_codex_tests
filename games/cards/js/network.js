export function registerHandlers(dc, handlers) {
    dc.on('data', async data => {
        const msg = JSON.parse(data);
        if (msg.type === 'start' && handlers.onStart) {
            await handlers.onStart(msg);
        } else if (msg.type === 'name' && handlers.onName) {
            handlers.onName(msg);
        }
    });
}

export async function hostGame(qrDiv, qrText) {
    qrDiv.style.display = 'block';
    const conn = await CodeConnect.host({ text: qrText });
    qrDiv.style.display = 'none';
    return conn ? conn.dc : null;
}

export async function joinGame(qrDiv, qrText) {
    qrDiv.style.display = 'block';
    const conn = await CodeConnect.join({ text: qrText });
    qrDiv.style.display = 'none';
    return conn ? conn.dc : null;
}
