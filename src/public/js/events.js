document.addEventListener('DOMContentLoaded', () => {
    const addForm = document.getElementById('addEventForm');
    const editForm = document.getElementById('editEventForm');

    function validateEvent(data) {
        const date = data.eventDate ? new Date(data.eventDate) : null;
        const day = date ? date.getDate() : null;
        const month = date ? (date.getMonth() + 1) : null;
        const year = date ? date.getFullYear() : null;
        const errors = [];
        if (!date || isNaN(date.getTime())) errors.push('Event date is required and must be a valid date');
        if (year && (year < 1900 || year > new Date().getFullYear())) errors.push('Year must be reasonable');
        if (data.message && data.message.length > 1000) errors.push('Message too long');
        return errors;
    }

    async function fetchEvents() {
        try {
            const res = await fetch('/api/events');
            return await res.json();
        } catch (err) {
            console.error('Failed to fetch events', err);
            return { events: [] };
        }
    }

    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addForm);
            const data = Object.fromEntries(formData.entries());
            if (data.recipients) data.recipients = data.recipients.split(',').map(s => s.trim()).filter(Boolean);
            const errors = validateEvent(data);
            if (errors.length) return alert(errors.join('\n'));

            // POST eventDate as string (YYYY-MM-DD)
            await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            location.reload();
        });
    }

    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(editForm);
            const data = Object.fromEntries(formData.entries());
            const id = data.id; delete data.id;
            if (data.recipients) data.recipients = data.recipients.split(',').map(s => s.trim()).filter(Boolean);
            data.isActive = data.isActive === 'true' || data.isActive === true;
            const errors = validateEvent(data);
            if (errors.length) return alert(errors.join('\n'));

            await fetch(`/api/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            location.reload();
        });
    }

    // WebSocket to receive live updates (optional)
    const ws = new WebSocket(`ws://${window.location.host}`);
    ws.onmessage = (msg) => {
        try {
            const data = JSON.parse(msg.data);
            if (data.type === 'event-updated') {
                // simple refresh for now
                location.reload();
            }
        } catch (err) {
            // ignore
        }
    };
});
