**Tech Specification Document**  
**Project: Auralis**  
**Versi: 1.0**  
**Tanggal: 1 April 2026**  
**Dibuat untuk: Proyek Web Companion Anak Autis**

### 1. Pendahuluan / Project Overview

**Auralis** adalah aplikasi web berbasis browser yang berfungsi sebagai **pendamping digital interaktif** untuk melatih pengenalan emosi, komunikasi, dan interaksi sosial pada anak dengan Autism Spectrum Disorder (ASD).  

Aplikasi ini menggantikan robot fisik menjadi versi web yang lebih terjangkau, mudah diakses, dan dapat digunakan di HP, laptop, atau tablet menggunakan kamera & mikrofon bawaan device.  

Fokus utama Auralis adalah memberikan interaksi yang **konsisten, predictable, positif, dan terstruktur** — sesuai kebutuhan anak autis yang merasa lebih aman dengan rutinitas yang jelas. Semua pemrosesan dilakukan di sisi client (browser) untuk menjaga privasi dan tidak memerlukan biaya server AI.

### 2. Tujuan

- Membantu anak autis melatih pengenalan emosi wajah (dirinya sendiri dan orang lain).
- Melatih respons verbal sederhana melalui interaksi suara.
- Memberikan umpan balik visual + suara yang ramah dan mendukung.
- Menciptakan pengalaman terapi yang aman, menyenangkan, dan dapat dilakukan kapan saja di rumah atau sekolah.
- Menjadi alternatif murah dan scalable dari robot terapi konvensional.

### 3. Target Pengguna

- Anak usia 5–12 tahun dengan Autism Spectrum Disorder (tingkat ringan hingga sedang).
- Orang tua / caregiver.
- Terapis atau guru pendamping di sekolah inklusi / terapi.
- Tidak memerlukan kemampuan teknis tinggi (UI sangat ramah anak).

### 4. Fitur Utama

- Real-time emotion recognition via webcam.
- Speech recognition (pengenalan kata sederhana dalam Bahasa Indonesia).
- Text-to-Speech dengan suara ramah dan pelan.
- Umpan balik visual (emoji besar, animasi, gambar, confetti).
- Sistem sesi terstruktur dengan level kesulitan bertahap.
- Konteks sesi (memori progress dalam satu sesi).
- Mode pembukaan, warm-up, latihan utama, review, dan penutup.
- Tombol darurat: Ulangi, Istirahat, Akhiri Sesi.
- Riwayat sesi sederhana (opsional disimpan secara lokal).

### 5. Tech Stack

| Layer              | Teknologi                          | Alasan |
|--------------------|------------------------------------|--------|
| Frontend Framework | React.js (atau Vanilla JS jika ingin lebih ringan) | UI interaktif, animasi mudah, state management untuk konteks sesi |
| Bahasa Pemrograman | JavaScript (ES6+)                  | Client-side full |
| Styling            | CSS3 + Tailwind CSS                | Desain ramah anak (warna cerah, font besar) |
| Hosting            | Vercel / Netlify                   | Gratis, cepat, deploy otomatis |
| State Management   | React Context / Zustand            | Mengelola konteks sesi |
| Storage Lokal      | LocalStorage / IndexedDB           | Simpan progress tanpa server |

### 6. Teknologi & Library yang Diperlukan (Semua Gratis 100%)

| Komponen                    | Library / Teknologi                     | Keterangan |
|-----------------------------|-----------------------------------------|------------|
| Emotion Recognition         | face-api.js + TensorFlow.js             | Real-time face detection & emotion classification (happy, sad, neutral, confused, dll) di browser |
| Speech Recognition (Input)  | Web Speech API (SpeechRecognition)      | Built-in browser, mendengar suara anak |
| Text-to-Speech (Output)     | Web Speech API (SpeechSynthesis)        | Suara pujian & instruksi |
| Akses Kamera & Mikrofon     | HTML5 getUserMedia()                    | Standar browser |
| Visual & Animasi            | CSS Animation + Lottie (opsional)       | Emoji besar, animasi kartun, efek positif |

**Catatan penting**: Tidak ada API berbayar, tidak ada server AI eksternal. Semua berjalan on-device.

### 7. Arsitektur Sistem

- **Client-Side Only** (Single Page Application).
- Semua pemrosesan (kamera, emosi, suara, logic) dilakukan di browser pengguna.
- Tidak ada backend (kecuali jika nanti ditambahkan Firebase/Supabase untuk simpan data sesi antar device).
- Flow data: Kamera → face-api.js → Speech API → Logic Engine (Rule-based + Konteks Sesi) → Output (Suara + Visual).

### 8. Alur Aplikasi (User Flow)

1. **Landing / Mulai Sesi** → Pilih nama anak + jenis sesi.
2. **Pembukaan** → Salam ramah + penjelasan singkat.
3. **Warm-up** → Deteksi wajah & kalibrasi singkat.
4. **Latihan Utama** → Loop real-time:  
   - Deteksi emosi setiap frame  
   - Dengar suara jika diaktifkan  
   - Jalankan Logic Engine  
   - Beri respons suara + visual
5. **Review** → Ringkasan pencapaian + pujian besar.
6. **Penutup** → Salam perpisahan + reward visual.
7. **Istirahat / Akhiri** → Kapan saja via tombol.

### 9. Logic Pemrosesan & Pengambilan Keputusan

- Menggunakan **Rule-Based System** + **State Machine**.
- Input: Emosi dominan + confidence score + teks suara + konteks sesi saat ini.
- Output: Respons suara pendek + visual + tindakan selanjutnya (lanjut, ulangi, istirahat, naik level).
- Selalu positif, pendek (1–2 kalimat), dan konsisten.
- Tidak ada AI percakapan bebas (ChatGPT style) agar tetap predictable untuk anak autis.

### 10. Konteks Sesi (Core Memory)

Konteks sesi menyimpan:
- Jenis sesi & level kesulitan saat ini.
- Progress (poin, latihan selesai, streak berhasil).
- Riwayat emosi dominan dalam sesi.
- Durasi sesi.
- Preferensi khusus anak (nama, reward favorit).
  
Konteks ini digunakan setiap pengambilan keputusan agar aplikasi terasa “mengerti” anak dan tidak acak.

### 11. Persyaratan Non-Fungsional

- **Performa**: Real-time (≤ 1 detik respons), ringan di HP kelas menengah.
- **Privasi**: Semua data (gambar wajah & suara) tidak dikirim ke server.
- **Aksesibilitas**: UI besar, kontras tinggi, mode full-screen, navigasi keyboard.
- **Bahasa**: Utama Bahasa Indonesia (suara & teks).
- **Offline**: Bisa digunakan setelah halaman pertama kali dimuat.
- **Keamanan**: Hanya meminta izin kamera & mikrofon sekali.

### 12. Asumsi & Kendala

- Asumsi: Browser utama Chrome/Edge (paling stabil untuk Web Speech API).
- Kendala: Akurasi speech recognition lebih baik untuk kata sederhana; performa di HP lama mungkin sedikit lambat.
- Tidak mendukung bahasa daerah (hanya Bahasa Indonesia standar).

### 13. Rencana Pengembangan Selanjutnya (Future Enhancements)

- Simpan riwayat sesi antar device (Firebase).
- Mode multiplayer (orang tua melihat dari device lain).
- Custom model emotion recognition untuk anak Indonesia.
- Aplikasi PWA (bisa di-install seperti app).
- Integrasi laporan untuk terapis.
