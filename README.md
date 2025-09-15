# WABot-NutriAI - WhatsApp Nutrition Assistant & AI Chatbot

WABot-NutriAI adalah chatbot WhatsApp yang cerdas yang membantu pengguna dengan rekomendasi nutrisi personal dan obrolan AI seputar kesehatan dan nutrisi.

> ⚠️ **Catatan Penting**: Fitur rekomendasi makanan memerlukan model Machine Learning terpisah yang tidak disertakan dalam repository ini. Anda perlu mengembangkan atau menyediakan API model ML Anda sendiri untuk mengaktifkan fitur ini.

## Fitur Utama

- 🍽️ **Rekomendasi Makanan Personal**: Berdasarkan profil pengguna (usia, berat badan, tinggi badan, aktivitas, tujuan)
- 💬 **Chat AI Nutrisi**: Obrolan interaktif dengan AI tentang kesehatan, nutrisi, diet, dan olahraga
- 📊 **Kalkulasi Nutrisi**: Menghitung BMI, BMR, dan kebutuhan kalori harian
- 🔐 **Aman & Privat**: Semua data disimpan sementara dan tidak dipersistenkan

## Cara Kerja

1. Kirim pesan `!halo` untuk memulai
2. Pilih antara:
   - `!recomend` untuk mendapatkan rekomendasi makanan berdasarkan profil Anda
   - `!chat` untuk mengobrol dengan AI seputar nutrisi dan kesehatan

### Mode Rekomendasi
Bot akan menanyakan beberapa pertanyaan untuk membangun profil nutrisi Anda:
- Gender
- Berat badan (kg)
- Tinggi badan (cm)
- Usia (tahun)
- Tingkat aktivitas (1-5)
- Tujuan (menurunkan berat badan, menambah massa otot, menjaga kesehatan)

### Mode Chat AI
Tanyakan apa saja seputar nutrisi dan kesehatan. Bot akan otomatis keluar dari mode chat setelah 3 menit tidak aktif.

## Prasyarat

- Node.js (versi 14 atau lebih tinggi)
- NPM (Node Package Manager)
- Akun WhatsApp

## Instalasi

1. Clone repository ini:
   ```bash
   git clone https://github.com/PanPanFR/WABot-NutriAI.git
   cd WABot-NutriAI
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Konfigurasi file `.env`:
   Salin file `.env.example` ke `.env` dan isi dengan nilai yang sesuai:
   ```bash
   cp .env.example .env
   ```
   
   Kemudian edit file `.env`:
   ```env
   # WhatsApp Web Configuration
   WWEB_VERSION=2.3000.1024710243-alpha

   # API Configuration
   API_RECOMEND_URL=your_api_recomend_url_here
   OPENROUTER_API_KEY=your_openrouter_api_key_here

   # AI Model Configuration
   AI_MODEL=deepseek/deepseek-r1:free

   # Chat Configuration
   INACTIVITY_TIMEOUT_MINUTES=3
   ```

4. Jalankan bot:
   ```bash
   npm start
   ```

5. Scan QR code yang muncul di terminal menggunakan WhatsApp Anda untuk login.

## Perintah Bot

- `!halo` - Menampilkan menu utama
- `!recomend` - Memulai proses rekomendasi makanan
- `!chat` - Memulai mode chat AI
- `!stop` - Keluar dari mode chat AI

## Teknologi yang Digunakan

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - Library untuk menghubungkan bot dengan WhatsApp Web
- [OpenRouter](https://openrouter.ai/) - API untuk model AI
- [Node.js](https://nodejs.org/) - Runtime environment
- [Axios](https://axios-http.com/) - HTTP client untuk API requests

## Kontribusi

Kontribusi sangat diterima! Silakan buat pull request atau buka issue untuk saran dan perbaikan.

## Lisensi

MIT License - lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

## Disclaimer

Bot ini dibuat untuk tujuan edukasi dan bantuan nutrisi personal. Untuk saran medis profesional, selalu konsultasikan dengan dokter atau ahli gizi yang memenuhi syarat.

Fitur rekomendasi makanan bergantung pada model Machine Learning eksternal yang tidak disertakan dalam repository ini. Pengguna perlu menyediakan API model ML mereka sendiri untuk mengaktifkan fitur ini.