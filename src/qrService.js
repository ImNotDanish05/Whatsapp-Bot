const fs = require('fs/promises');
const path = require('path');
const QRCode = require('qrcode');

const storageDir = path.join(__dirname, 'storage', 'qr');
const publicDir = path.join(__dirname, 'public', 'storage', 'qr');
const jsonPath = path.join(storageDir, 'qr.json');
const pngFileName = 'qr.png';
const pngPath = path.join(publicDir, pngFileName);
const publicUrl = `/storage/qr/${pngFileName}`;

async function ensureDirs() {
    await fs.mkdir(storageDir, { recursive: true });
    await fs.mkdir(publicDir, { recursive: true });
}

async function initQrState() {
    await ensureDirs();
    // If a state file already exists, keep it; otherwise seed an empty state.
    try {
        await fs.access(jsonPath);
    } catch {
        const payload = {
            status: 'empty',
            qr_url: null,
            updated_at: null
        };
        await fs.writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
    }
}

async function saveQrString(qrString) {
    await ensureDirs();

    // Generate PNG from the raw QR string.
    await QRCode.toFile(pngPath, qrString, {
        type: 'png',
        width: 400,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    });

    const payload = {
        status: 'pending',
        qr_url: publicUrl,
        qr_string: qrString,
        updated_at: new Date().toISOString()
    };

    await fs.writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
    return payload;
}

async function markAuthenticated(sessionInfo = null) {
    await ensureDirs();
    const payload = {
        status: 'authenticated',
        // Keep the last QR PNG on disk so you can verify generation even after auth.
        qr_url: publicUrl,
        session: sessionInfo,
        updated_at: new Date().toISOString()
    };
    await fs.writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
    return payload;
}

async function getQrState() {
    try {
        const raw = await fs.readFile(jsonPath, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return {
                status: 'empty',
                qr_url: null,
                updated_at: null
            };
        }
        throw err;
    }
}

module.exports = {
    saveQrString,
    markAuthenticated,
    getQrState,
    publicUrl,
    initQrState
};
