document.addEventListener('DOMContentLoaded', () => {
    const sendMessageForm = document.getElementById('sendMessageForm');
    const pingBtn = document.getElementById('pingBtn');
    const cronBtn = document.getElementById('cronBtn');
    const logConsole = document.getElementById('log-console');
    const qrStatusEls = [document.getElementById('qr-status'), document.getElementById('home-qr-status')];
    const readyStatusEls = [document.getElementById('ready-status'), document.getElementById('home-ready-status')];
    const qrImageEls = [document.getElementById('qr-image'), document.getElementById('home-qr-image')];
    const qrHintEls = [document.getElementById('qr-hint'), document.getElementById('home-qr-hint')];
    const lastSentStatus = document.getElementById('last-sent-status');
    const lastIncomingMessage = document.getElementById('last-incoming-message');

    const setStatus = (els, text, colorClass) => {
        els.forEach(el => {
            if (!el) return;
            el.textContent = text;
            el.classList.remove('text-red-500', 'text-yellow-500', 'text-green-500');
            el.classList.add(colorClass);
        });
    };

    const setHint = (hint) => {
        qrHintEls.forEach(el => {
            if (el) el.textContent = hint;
        });
    };

    const setQrImage = (url) => {
        qrImageEls.forEach(img => {
            if (!img) return;
            if (url) {
                img.src = `${url}?t=${Date.now()}`;
                img.classList.remove('hidden');
            } else {
                img.src = '';
                img.classList.add('hidden');
            }
        });
    };

    const refreshQrFromApi = async () => {
        try {
            const res = await fetch('/api/qr');
            const data = await res.json();
            const status = data.qr_status || 'empty';

            if (status === 'authenticated') {
                setStatus(qrStatusEls, 'Authenticated', 'text-green-500');
                setStatus(readyStatusEls, 'Ready', 'text-green-500');
                setQrImage(null);
                setHint('Connected. QR no longer needed.');
                return;
            }

            if (data.qr_url) {
                setStatus(qrStatusEls, 'Pending', 'text-yellow-500');
                setStatus(readyStatusEls, 'No', 'text-red-500');
                setQrImage(data.qr_url);
                setHint('Scan this QR with WhatsApp > Link a device.');
            } else {
                setStatus(qrStatusEls, 'Unavailable', 'text-red-500');
                setStatus(readyStatusEls, 'No', 'text-red-500');
                setQrImage(null);
                setHint('Waiting for QR code...');
            }
        } catch (error) {
            setStatus(qrStatusEls, 'Error', 'text-red-500');
            setHint('Failed to fetch QR. Check server logs.');
            console.error('Failed to fetch QR state', error);
        }
    };

    // Poll QR endpoint for reliability (no WebSocket reliance).
    refreshQrFromApi();
    setInterval(refreshQrFromApi, 10000);

    // Optional WebSocket for live logs (non-critical for QR).
    if (logConsole) {
        const ws = new WebSocket(`ws://${window.location.host}`);

        ws.onopen = () => {
            logConsole.innerHTML += `<p class="text-green-400">Connected to WebSocket server</p>`;
        };

        ws.onmessage = event => {
            const data = JSON.parse(event.data);
            logConsole.innerHTML += `<p class="text-gray-400">[${new Date().toLocaleTimeString()}] ${data.message}</p>`;

            switch (data.type) {
                case 'ready':
                    setStatus(readyStatusEls, 'Ready', 'text-green-500');
                    break;
                case 'sent':
                    if (lastSentStatus) lastSentStatus.textContent = data.message;
                    break;
                case 'incoming':
                    if (lastIncomingMessage) lastIncomingMessage.textContent = data.message;
                    break;
            }
        };

        ws.onclose = () => {
            logConsole.innerHTML += `<p class=\"text-red-400\">Disconnected from WebSocket server</p>`;
        };
    }

    if (sendMessageForm) {
        sendMessageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;

            try {
                const response = await fetch('/api/test/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ phone, message })
                });
                const result = await response.json();
                alert(result.message);
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Failed to send message');
            }
        });
    }

    if (pingBtn) {
        pingBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/test/ping', {
                    method: 'POST'
                });
                const result = await response.json();
                alert(result.message);
            } catch (error) {
                console.error('Error pinging bot:', error);
                alert('Failed to ping bot');
            }
        });
    }

    if (cronBtn) {
        cronBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/test/cron', {
                    method: 'POST'
                });
                const result = await response.json();
                alert(result.message);
            } catch (error) {
                console.error('Error simulating cron:', error);
                alert('Failed to simulate cron');
            }
        });
    }
});
