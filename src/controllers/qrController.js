const { getQrState } = require('../qrService');

// @desc    Get current QR state and URL
// @route   GET /api/qr
// @access  Public
exports.getQr = async (req, res) => {
    try {
        const state = await getQrState();
        res.status(200).json({
            status: 'ok',
            qr_url: state.qr_url || null,
            session: state.session || null,
            qr_status: state.status || 'empty',
            updated_at: state.updated_at || null
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to read QR state', error });
    }
};
