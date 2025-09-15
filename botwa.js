require('dotenv').config();
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const wwebVersion = process.env.WWEB_VERSION;
const apiUrl = process.env.API_RECOMEND_URL;
const openRouterKey = process.env.OPENROUTER_API_KEY;
const aiModel = process.env.AI_MODEL;
const inactivityTimeout = parseInt(process.env.INACTIVITY_TIMEOUT_MINUTES) * 60 * 1000;

let userData = {};
let userStatus = {};
let aiMode = {};
let chatTimeouts = {};

const kataKunciAI = [
    'nutrisi','gizi','makan','diet','sehat','kesehatan','kalori','vitamin',
    'mineral','protein','karbohidrat','lemak','olahraga','berat badan',
    'metabolisme','bmi','minuman'
];

const setAutoExitTimeout = (chatId) => {
    if (chatTimeouts[chatId]) clearTimeout(chatTimeouts[chatId]);

    chatTimeouts[chatId] = setTimeout(() => {
        aiMode[chatId] = false;
        chatTimeouts[chatId] = null;
        client.sendMessage(chatId, `⌛ Anda tidak aktif selama ${process.env.INACTIVITY_TIMEOUT_MINUTES} menit. Mode chat AI dihentikan otomatis.`);
    }, inactivityTimeout);
};

const isTopikSehat = (text) => {
    // Cek apakah pesan mengandung setidaknya satu kata kunci dari kataKunciAI
    const lower = text.toLowerCase();
    return kataKunciAI.some(kata => lower.includes(kata));
};

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {},
    webVersionCache: {
        type: 'remote',
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
    },
});

client.on('qr', (qr) => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('WhatsApp client ready!'));

client.on('message', async (msg) => {
    const chatId = msg.from;
    const text = msg.body.trim().toLowerCase();

    // 🌐 Menu utama
    if (text === '!halo') {
        msg.reply(`👋 *Halo! Saya adalah Asisten Nutrisi Digital Anda.*

Ketik salah satu dari pilihan berikut untuk memulai:

🥗 *!recomend* — Rekomendasi makanan berdasarkan profil Anda  
💬 *!chat* — Ngobrol bebas terkait nutrisi dan kesehatan dengan AI`);
        return;
    }

    // 💬 Mode Chat AI aktif
    if (aiMode[chatId]) {
        if (text === '!stop') {
            aiMode[chatId] = false;
            clearTimeout(chatTimeouts[chatId]);
            msg.reply('🛑 Mode chat AI dihentikan. Ketik `!chat` untuk mulai lagi.');
            return;
        }

        // Batasi chat AI hanya untuk topik sehat/nutrisi
        if (!isTopikSehat(text)) {
            msg.reply('❌ Mohon hanya bertanya terkait kesehatan, nutrisi, diet, olahraga, atau topik sejenis.');
            return;
        }

        setAutoExitTimeout(chatId);

        try {
            // Kirim pesan loading (italic)
            const loadingMsg = await client.sendMessage(chatId, '_AI sedang merespon pertanyaan Anda..._');

            const aiReply = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: aiModel,
                    messages: [
                        { role: 'system', content: 'You are a helpful AI assistant for health and nutrition.' },
                        { role: 'user', content: msg.body }
                    ],
                    temperature: 0.7,
                },
                {
                    headers: {
                        Authorization: `Bearer ${openRouterKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://your-app-url.com',
                        'X-Title': 'NutritionAssistantBot',
                    },
                }
            );

            // Hapus pesan loading
            await loadingMsg.delete(true);

            const reply = aiReply.data.choices[0].message.content;
            msg.reply(reply);
        } catch (err) {
            console.error(err.response?.data || err.message);
            msg.reply('⚠️ Gagal mendapatkan respon dari AI. Coba lagi nanti.');
        }
        return;
    }

    // 🔁 Masuk ke Mode Chat
    if (text === '!chat') {
        aiMode[chatId] = true;
        setAutoExitTimeout(chatId);
        msg.reply('💬 *Mode Chat AI aktif!*\nTanyakan apa saja seputar nutrisi dan kesehatan.\n\nKetik `!stop` untuk keluar.');
        return;
    }

    // ✅ Mode Rekomendasi
    if (text === '!recomend') {
        userData[chatId] = {};
        userStatus[chatId] = 'awaiting_gender';
        msg.reply('👋 *Halo!* Mari kita mulai.\n\n❓ Silakan ketik *gender Anda*:\n👨 male / 👩 female');
        return;
    }

    const isNumeric = (val) => !isNaN(val) && isFinite(val);

    if (userStatus[chatId] === 'awaiting_gender') {
        if (text !== 'male' && text !== 'female') {
            msg.reply('❗ *Input tidak valid.*\nKetik *male* atau *female* saja.');
            return;
        }
        userData[chatId].gender = text;
        userStatus[chatId] = 'awaiting_weight';
        msg.reply('⚖️ *Berapa berat badan Anda?* (kg)');
    } else if (userStatus[chatId] === 'awaiting_weight') {
        if (!isNumeric(text)) return msg.reply('❗ Masukkan angka untuk berat badan.');
        userData[chatId].weight = parseInt(text);
        userStatus[chatId] = 'awaiting_height';
        msg.reply('📏 *Berapa tinggi badan Anda?* (cm)');
    } else if (userStatus[chatId] === 'awaiting_height') {
        if (!isNumeric(text)) return msg.reply('❗ Masukkan angka untuk tinggi badan.');
        userData[chatId].height = parseInt(text);
        userStatus[chatId] = 'awaiting_age';
        msg.reply('🎂 *Berapa usia Anda?* (tahun)');
    } else if (userStatus[chatId] === 'awaiting_age') {
        if (!isNumeric(text)) return msg.reply('❗ Masukkan angka untuk usia.');
        userData[chatId].age = parseInt(text);
        userStatus[chatId] = 'awaiting_activity';
        msg.reply(`💪 *Seberapa aktif Anda?*

1️⃣ Rendah – Banyak duduk, minim olahraga  
2️⃣ Cukup – Jalan kaki ringan beberapa kali seminggu  
3️⃣ Aktif – Olahraga sedang 3-5 kali seminggu  
4️⃣ Sangat aktif – Olahraga berat hampir setiap hari  
5️⃣ Ekstra aktif – Aktivitas fisik sangat berat setiap hari

✍️ Ketik *angka 1-5* sesuai kondisi Anda`);

    } else if (userStatus[chatId] === 'awaiting_activity') {
        const activityMap = {
            '1': 'sedentary',
            '2': 'lightly_active',
            '3': 'moderately_active',
            '4': 'very_active',
            '5': 'extra_active',
        };
        if (!activityMap[text]) return msg.reply('❗ Pilih angka 1-5.');
        userData[chatId].activity = activityMap[text];
        userStatus[chatId] = 'awaiting_objective';
        msg.reply(`🎯 *Apa tujuan Anda?*
            
            1️⃣ Menurunkan berat badan
            2️⃣ Menambah massa otot
            3️⃣ Menjaga kesehatan
            
            ✍️ Ketik *angka 1-3* sesuai tujuan Anda`);
            
    } else if (userStatus[chatId] === 'awaiting_objective') {
        const objectiveMap = {
            '1': 'weight_loss',
            '2': 'muscle_gain',
            '3': 'health_maintenance',
        };
        if (!objectiveMap[text]) return msg.reply('❗ Pilih angka 1-3.');
        userData[chatId].objective = objectiveMap[text];
        userStatus[chatId] = null;

        const { weight, height, age, gender, activity, objective } = userData[chatId];
        const heightM = height / 100;
        const bmi = (weight / (heightM * heightM)).toFixed(1);
        const bmr = gender === 'male'
            ? 10 * weight + 6.25 * height - 5 * age + 5
            : 10 * weight + 6.25 * height - 5 * age - 161;
        const activityFactor = {
            sedentary: 1.2,
            lightly_active: 1.375,
            moderately_active: 1.55,
            very_active: 1.725,
            extra_active: 1.9,
        }[activity];
        let tdee = bmr * activityFactor;
        if (objective === 'weight_loss') tdee -= 500;
        if (objective === 'muscle_gain') tdee += 500;

        let nutritionTips = '';
        if (objective === 'weight_loss') nutritionTips = '💡 Tips: Fokus pada defisit kalori dan konsumsi protein cukup untuk menjaga otot.';
        else if (objective === 'muscle_gain') nutritionTips = '💡 Tips: Tingkatkan asupan kalori dan protein untuk mendukung pertumbuhan otot.';
        else nutritionTips = '💡 Tips: Konsumsi makanan seimbang dan aktif bergerak untuk menjaga kesehatan.';

        await msg.reply(`📊 *Ringkasan Anda:*  
- Gender: ${gender}  
- Berat: ${weight} kg  
- Tinggi: ${height} cm  
- Usia: ${age}  
- Aktivitas: ${activity.replace('_', ' ')}  
- Tujuan: ${objective.replace('_', ' ')}  

💡 *BMI:* ${bmi}  
🔥 *BMR:* ${Math.round(bmr)} kalori/hari  
🍽️ *Kalori Target:* ${Math.round(tdee)} kalori/hari  

${nutritionTips}`);

        // Kirim pesan loading italic dan simpan untuk dihapus nanti
        const loadingMsg = await client.sendMessage(chatId, '_⏳ Mengambil rekomendasi makanan..._');

        try {
            const response = await axios.post(apiUrl, userData[chatId]);
            const recipes = response.data;

            // Hapus pesan loading
            await loadingMsg.delete(true);

            if (recipes.length > 0) {
                let reply = '🍱 *Rekomendasi Makanan:*\n\n';
                recipes.forEach((item, i) => {
                    reply += `✅ ${i + 1}. *${item.Name}*\n🔥 ${item.Calories} kalori\n\n`;
                });
                msg.reply(reply);
            } else {
                msg.reply('❌ Tidak ada rekomendasi ditemukan.');
            }
        } catch (err) {
            console.error(err);
            // Hapus pesan loading jika error
            await loadingMsg.delete(true);
            msg.reply('⚠️ Terjadi kesalahan saat mengambil rekomendasi.');
        }
    }
});

client.initialize();
