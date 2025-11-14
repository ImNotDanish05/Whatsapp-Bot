document.addEventListener('DOMContentLoaded', () => {
    const sendMessageForm = document.getElementById('sendMessageForm');
    const pingBtn = document.getElementById('pingBtn');
    const cronBtn = document.getElementById('cronBtn');
    const logConsole = document.getElementById('log-console');
    const qrStatus = document.getElementById('qr-status');
    const readyStatus = document.getElementById('ready-status');
    const lastSentStatus = document.getElementById('last-sent-status');
    const lastIncomingMessage = document.getElementById('last-incoming-message');

    // WebSocket connection
    const ws = new WebSocket(`ws://${window.location.host}`);

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
        logConsole.innerHTML += `<p class="text-green-400">Connected to WebSocket server</p>`;
    };

    ws.onmessage = event => {
        const data = JSON.parse(event.data);
        logConsole.innerHTML += `<p class="text-gray-400">[${new Date().toLocaleTimeString()}] ${data.message}</p>`;

        switch (data.type) {
            case 'qr':
                qrStatus.textContent = 'Scanned';
                qrStatus.classList.remove('text-red-500');
                qrStatus.classList.add('text-green-500');
                break;
            case 'ready':
                readyStatus.textContent = 'Ready';
                readyStatus.classList.remove('text-red-500');
                readyStatus.classList.add('text-green-500');
                break;
            case 'sent':
                lastSentStatus.textContent = data.message;
                break;
            case 'incoming':
                lastIncomingMessage.textContent = data.message;
                break;
        }
    };

    ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
        logConsole.innerHTML += `<p class="text-red-400">Disconnected from WebSocket server</p>`;
    };

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
});
