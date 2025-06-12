const QrConnect = (() => {
    let scanner = null;

    function startScan(video, callback) {
        scanner = new QrScanner(video, result => callback(result.data));
        scanner.start();
    }

    function stopScan() {
        if (scanner) {
            scanner.stop();
            scanner.destroy();
            scanner = null;
        }
    }

    function waitForIce(pc) {
        return new Promise(res => {
            if (pc.iceGatheringState === 'complete') {
                res();
            } else {
                pc.onicegatheringstatechange = () => {
                    if (pc.iceGatheringState === 'complete') res();
                };
            }
        });
    }

    function showQr(canvas, data) {
        QRCode.toCanvas(canvas, data);
    }

    async function showQrAndScan(elems, data) {
        const {container, canvas, video} = elems;
        container.style.display = 'block';
        canvas.style.display = 'block';
        video.style.display = 'block';
        showQr(canvas, data);
        return new Promise(resolve => {
            startScan(video, resolve);
        });
    }

    async function host(elems, label = 'data') {
        const {text, container} = elems;
        const pc = new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});
        const dc = pc.createDataChannel(label);
        await pc.setLocalDescription(await pc.createOffer());
        await waitForIce(pc);
        text.textContent = 'Poczekaj na odpowiedź i zeskanuj kod';
        const answer = await showQrAndScan(elems, JSON.stringify(pc.localDescription));
        stopScan();
        await pc.setRemoteDescription(JSON.parse(answer));
        container.style.display = 'none';
        return {pc, dc};
    }

    async function join(elems, label = 'data') {
        const {text, container, canvas, video} = elems;
        const pc = new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});
        let dc = null;
        pc.ondatachannel = e => { dc = e.channel; };
        text.textContent = 'Zeskanuj kod hosta';
        container.style.display = 'block';
        canvas.style.display = 'none';
        video.style.display = 'block';
        const offer = await new Promise(resolve => startScan(video, resolve));
        stopScan();
        await pc.setRemoteDescription(JSON.parse(offer));
        await pc.setLocalDescription(await pc.createAnswer());
        await waitForIce(pc);
        text.textContent = 'Pokaż ten kod hostowi';
        const confirm = await showQrAndScan(elems, JSON.stringify(pc.localDescription));
        stopScan();
        await pc.setRemoteDescription(JSON.parse(confirm));
        container.style.display = 'none';
        return {pc, dc};
    }

    return {host, join};
})();
