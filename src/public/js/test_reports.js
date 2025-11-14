document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('reports-table-body');
    const phoneFilter = document.getElementById('phoneFilter');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const filterBtn = document.getElementById('filterBtn');

    let logs = [];

    const renderTable = (data) => {
        tableBody.innerHTML = '';
        data.forEach(log => {
            const row = `
                <tr>
                    <td class="py-3 px-4">${log.phone || 'N/A'}</td>
                    <td class="py-3 px-4">${log.message}</td>
                    <td class="py-3 px-4">${log.response}</td>
                    <td class="py-3 px-4">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${log.status}
                        </span>
                    </td>
                    <td class="py-3 px-4">${log.type}</td>
                    <td class="py-3 px-4">${new Date(log.createdAt).toLocaleString()}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    };

    const fetchLogs = async () => {
        try {
            const response = await fetch('/api/test/logs');
            logs = await response.json();
            renderTable(logs);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    const filterLogs = () => {
        let filteredLogs = logs;

        const phone = phoneFilter.value.toLowerCase();
        if (phone) {
            filteredLogs = filteredLogs.filter(log => log.phone && log.phone.toLowerCase().includes(phone));
        }

        const status = statusFilter.value;
        if (status) {
            filteredLogs = filteredLogs.filter(log => log.status === status);
        }

        const date = dateFilter.value;
        if (date) {
            filteredLogs = filteredLogs.filter(log => new Date(log.createdAt).toLocaleDateString() === new Date(date).toLocaleDateString());
        }

        renderTable(filteredLogs);
    };

    filterBtn.addEventListener('click', filterLogs);
    fetchLogs();
});
