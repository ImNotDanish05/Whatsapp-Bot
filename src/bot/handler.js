const Conversation = require('../models/Conversation');
const Log = require('../models/Log');
const { getOrCreateSettings, renderTemplate } = require('../settingsService');
const webSocket = require('../websocket');

// Variable to hold the WhatsApp client instance
let whatsappClient = null;

// Function to attach the client after it's initialized
function attachClient(clientInstance) {
    whatsappClient = clientInstance;
}

module.exports.attachClient = attachClient;

// Simple fuzzy matching function
function similarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) {
            costs[s2.length] = lastValue;
        }
    }
    return costs[s2.length];
}

// Commands registry
const commands = {
    'help': {
        keywords: ['help', 'bantuan', 'apa yang bisa kamu lakukan', 'apa bisa kamu bantu', 'perintah', 'menu', 'mulai'],
        handler: async (msg, conversation) => {
            const helpMessage = `Perintah yang tersedia:
- "bantuan" - Tampilkan pesan bantuan ini
- "ulang tahun hari ini" - Tampilkan ulang tahun hari ini
- "daftar event" - Tampilkan semua event
- "daftar ulang tahun" - Tampilkan semua ulang tahun
- "ping" - Periksa apakah bot berfungsi
- "langganan" - Berlangganan notifikasi
- "berhenti langganan" - Berhenti dari notifikasi
- "bicara dengan ai" - Aktifkan mode chat AI
- "stop ai" - Keluar dari mode AI`;
            return helpMessage;
        }
    },
    'today_birthdays': {
        keywords: ['today birthdays', 'birthdays today', 'hari ini ulang tahun', 'ultah hari ini', 'hari ini siapa ultah', 'siapa yang ulang tahun hari ini', 'ultah hari ini siapa', 'ultah hari ini', 'siapa saja yang ultah hari ini'],
        handler: async (msg, conversation) => {
            try {
                // Query the Birthday model for today's birthdays
                const dayjs = require('dayjs');
                const Birthday = require('../models/Birthday');

                const today = dayjs();
                const currentDay = today.date();
                const currentMonth = today.month() + 1; // dayjs months are 0-indexed, but MongoDB uses 1-indexed months

                // Use MongoDB aggregation to find today's birthdays
                const todayBirthdays = await Birthday.aggregate([
                    {
                        $match: {
                            isActive: true,
                            $expr: {
                                $and: [
                                    { $eq: [{ $dayOfMonth: "$birthDate" }, currentDay] },
                                    { $eq: [{ $month: "$birthDate" }, currentMonth] }
                                ]
                            }
                        }
                    }
                ]);

                if (todayBirthdays.length === 0) {
                    return "Tidak ada yang ulang tahun hari ini.";
                } else {
                    let text = "Hari ini ulang tahun:\n";
                    for (const b of todayBirthdays) {
                        text += `• ${b.name} (${dayjs(b.birthDate).format("DD MMM")})\n`;
                    }
                    return text;
                }
            } catch (error) {
                console.error('Error getting today\'s birthdays:', error);
                return "Terjadi kesalahan saat memeriksa ulang tahun hari ini.";
            }
        }
    },
    'list_events': {
        keywords: ['list events', 'events', 'daftar event', 'event list', 'acara', 'daftar acara', 'event apa saja', 'ada event apa', 'event hari ini', 'event mendatang'],
        handler: async (msg, conversation) => {
            const Event = require('../models/Event');
            const dayjs = require('dayjs');

            try {
                // Query the Event model for all events
                const events = await Event.find({});

                if (events.length === 0) {
                    return "Tidak ada event yang tersimpan.";
                } else {
                    let text = "Daftar Event:\n";
                    for (const event of events) {
                        const isActiveText = event.isActive ? "aktif" : "tidak aktif";
                        const eventDate = dayjs(event.eventDate).format("DD/MM/YYYY");
                        const previewMessage = event.message ? `"${event.message}"` : "(pesan tidak diset)";
                        text += `• ${event.name} - ${eventDate} (${isActiveText}) ${previewMessage}\n`;
                    }
                    return text;
                }
            } catch (error) {
                console.error('Error getting events list:', error);
                return "Terjadi kesalahan saat mengambil daftar event.";
            }
        }
    },
    'list_birthdays': {
        keywords: ['list birthdays', 'birthdays', 'daftar ulang tahun', 'ultah', 'daftar ultah', 'semua ulang tahun', 'semua ultah'],
        handler: async (msg, conversation) => {
            const Birthday = require('../models/Birthday');
            const dayjs = require('dayjs');

            try {
                // Query the Birthday model for all birthdays
                const birthdays = await Birthday.find({});

                if (birthdays.length === 0) {
                    return "Belum ada data ulang tahun yang tersimpan.";
                } else {
                    let text = "Daftar Ulang Tahun:\n";
                    for (const birthday of birthdays) {
                        const birthDate = dayjs(birthday.birthDate);
                        const today = dayjs();
                        const age = today.diff(birthDate, 'year');
                        text += `• ${birthday.name} - ${birthDate.format("DD/MM/YYYY")} (Umur: ${age} tahun)\n`;
                    }
                    return text;
                }
            } catch (error) {
                console.error('Error getting birthdays list:', error);
                return "Terjadi kesalahan saat mengambil daftar ulang tahun.";
            }
        }
    },
    'subscribe': {
        keywords: ['subscribe', 'langganan', 'berlangganan', 'aktifkan notifikasi', 'aktifkan pengingat'],
        handler: async (msg, conversation) => {
            return "Anda telah berlangganan notifikasi.";
        }
    },
    'unsubscribe': {
        keywords: ['unsubscribe', 'berhenti langganan', 'hapus langganan', 'matikan notifikasi', 'hentikan pengingat'],
        handler: async (msg, conversation) => {
            return "Anda telah berhenti dari notifikasi.";
        }
    },
    'stats': {
        keywords: ['stats', 'statistik', 'statistik bot', 'penggunaan bot', 'jumlah penggunaan'],
        handler: async (msg, conversation) => {
            return "Berikut adalah statistik penggunaan bot...";
        }
    },
    'logs': {
        keywords: ['logs', 'log', 'riwayat', 'catatan', 'aktivitas'],
        handler: async (msg, conversation) => {
            return "Berikut adalah log aktivitas terbaru...";
        }
    },
    'ping': {
        keywords: ['ping', 'test', 'cek', 'status', 'aktif', 'hidup'],
        handler: async (msg, conversation) => {
            return "Pong! Saya aktif dan berfungsi dengan baik.";
        }
    },
    'ai_chat': {
        keywords: ['talk to ai', 'ask ai', 'chat ai', 'open ai chat', 'i want to talk with ai', 'ai', 'ai chat', 'bicara dengan ai', 'chat ai', 'mode ai', 'tanya ai', 'bicara ai dong'],
        handler: async (msg, conversation) => {
            conversation.aiMode = true;
            await conversation.save();
            return "Mode AI aktif. Silakan tanya apa saja.";
        }
    },
    'exit_ai': {
        keywords: ['exit ai', 'stop ai chat', 'quit ai', 'close ai', 'exit', 'stop ai', 'keluar dari ai', 'matikan mode ai'],
        handler: async (msg, conversation) => {
            conversation.aiMode = false;
            await conversation.save();
            return "Mode AI dimatikan. Ada yang bisa saya bantu lainnya?";
        }
    }
};

// Format phone to standard format
function formatPhoneJid(phone) {
    if (!phone) return null;
    if (phone.includes('@c.us')) return phone;
    if (phone.startsWith('+')) return `${phone.substring(1)}@c.us`;
    if (phone.startsWith('62')) return `${phone}@c.us`;
    return `62${phone.substring(1)}@c.us`;
}

// Main message handler
async function handleIncomingMessage(msg) {
    try {
        // Check if the message is from a group
        const isGroupMessage = msg.from.endsWith('@g.us');

        let text = msg.body || "";
        // If it's a group message and the bot is not mentioned, ignore the message
        if (isGroupMessage) {
            const botName = (process.env.BOT_NAME || "dan").toLowerCase().trim();
            const prefix = `!${botName}`;

            const raw = (msg.body || "").trim().toLowerCase();

            console.log("[GROUP MESSAGE] PrefixCheck =>", {
                botName,
                prefix,
                message: raw,
                startsWithPrefix: raw.startsWith(prefix)
            });

            // If bot not called → ignore
            if (!botName || !raw.startsWith(prefix)) {
                console.log("GROUP: Bot not called → ignoring message");
                return;
            }

            // Remove prefix from message before parsing commands
            text = raw.replace(prefix, "").trim();
        } else {
            // Private chat → process normally
            text = msg.body || "";
        }



        // Normalize the message text
        const normalizedText = text.toLowerCase().trim();
        console.log(`Received message from ${msg.from}: ${normalizedText}`);

        // Get phone without @c.us suffix
        const phone = msg.from.replace('@c.us', '');

        // Get or create conversation record
        let conversation = await Conversation.findOne({ phone });
        if (!conversation) {
            conversation = new Conversation({ phone });
            await conversation.save();
        }

        // Determine if this is a new conversation or if last message was over 1 hour ago
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour in milliseconds
        const isNewConversation = !conversation.lastMessageAt || conversation.lastMessageAt < oneHourAgo;

        let responseMessage = '';

        if (isNewConversation) {
            // Send opening message for new or returning users
            responseMessage = `Halo! Saya asisten WhatsApp Anda. Anda bisa meminta bantuan, memeriksa ulang tahun, event, atau berbicara dengan AI. Ketik "bantuan" untuk melihat perintah yang tersedia.`;
        } else {
            // Check if user is in AI mode
            if (conversation.aiMode) {
                // If user wants to exit AI mode
                if (normalizedText.includes('stop ai') || normalizedText.includes('keluar dari ai') || normalizedText.includes('matikan mode ai')) {
                    conversation.aiMode = false;
                    await conversation.save();
                    responseMessage = "Mode AI dimatikan. Ada yang bisa saya bantu lainnya?";
                } else {
                    // Forward to AI backend
                    const settings = await getOrCreateSettings();
                    if (settings.aiApiToken && settings.aiModelName) {
                        responseMessage = await getAIResponse(normalizedText, settings);
                    } else {
                        responseMessage = "Fitur AI belum dikonfigurasi. Mohon minta admin untuk mengatur pengaturan AI di dashboard web.";
                    }
                }
            } else {
                // Check for command matches
                let matchedCommand = null;
                let bestMatchScore = 0;

                for (const [commandName, commandDef] of Object.entries(commands)) {
                    for (const keyword of commandDef.keywords) {
                        const score = similarity(normalizedText, keyword);
                        if (score > bestMatchScore && score >= 0.7) {
                            bestMatchScore = score;
                            matchedCommand = commandDef;
                        }
                    }
                }

                if (matchedCommand) {
                    responseMessage = await matchedCommand.handler(msg, conversation);
                } else {
                    // Suggest commands or show error
                    responseMessage = `Saya tidak mengerti pesan tersebut. Ketik "bantuan" untuk melihat perintah yang tersedia.`;
                }
            }
        }

        // Update last message timestamp
        conversation.lastMessageAt = new Date();
        await conversation.save();

        // Send response
        if (responseMessage && whatsappClient) {
            await whatsappClient.sendMessage(msg.from, responseMessage);

            // Log the interaction
            await Log.create({
                phone: msg.from,
                status: 'success',
                message: responseMessage,
                type: 'reply'
            });
        }

        // Broadcast to WebSocket for UI updates
        webSocket.broadcast({
            type: 'message_reply',
            message: `Reply sent to ${msg.from}: ${responseMessage}`
        });
    } catch (error) {
        console.error('Error handling incoming message:', error);

        // Log the error
        await Log.create({
            phone: msg.from || 'unknown',
            status: 'failed',
            message: error.message || String(error),
            type: 'error'
        });

        // Attempt to send error response
        try {
            if (whatsappClient) {
                await whatsappClient.sendMessage(msg.from, "Maaf, saya mengalami error saat memproses permintaan Anda. Silakan coba lagi nanti.");
            }
        } catch (sendError) {
            console.error('Failed to send error response:', sendError);
        }
    }
}

// Function to get AI response
async function getAIResponse(prompt, settings) {
    try {
        // Check if the google-generative-ai package is available
        // If not, we'll return a message saying it needs to be installed
        let GoogleGenerativeAI;
        try {
            const genAIImport = require('@google/generative-ai');
            GoogleGenerativeAI = genAIImport.GoogleGenerativeAI;
        } catch (e) {
            console.error('Failed to import Google Generative AI:', e);
            return `Fitur AI tidak dikonfigurasi dengan benar. Paket '@google/generative-ai' tidak terinstal.`;
        }

        if (!settings.aiApiToken) {
            return `Fitur AI tidak dikonfigurasi dengan benar. Mohon minta admin untuk mengatur token API AI di dashboard web.`;
        }

        const genAI = new GoogleGenerativeAI(settings.aiApiToken);
        const model = genAI.getGenerativeModel({ model: settings.aiModelName || 'gemini-2.5-pro' });

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Error getting AI response:', error);
        return `Maaf, terjadi kesalahan saat meminta respon AI.`;
    }
}

module.exports = {
    handleIncomingMessage,
    similarity,
    attachClient
};