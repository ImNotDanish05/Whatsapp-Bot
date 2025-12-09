// Utility functions

function formatPhoneJid(phone) {
    if (!phone) return null;
    if (phone.includes('@c.us')) return phone;
    if (phone.startsWith('+')) return `${phone.substring(1)}@c.us`;
    if (phone.startsWith('62')) return `${phone}@c.us`;
    return `62${phone.substring(1)}@c.us`;
}

module.exports = {
    formatPhoneJid
};