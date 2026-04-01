**✅ Roadmap Lengkap “Finish 100%” Project Auralis**

Berikut adalah **semua yang perlu kamu terapkan** agar project Auralis menjadi aplikasi web yang **sepenuhnya fungsional, siap dipakai anak autis/orang tua/terapis**, dan bisa di-deploy (MVP production-ready).

### 1. Model Machine Learning yang Diperlukan

| Model | Ukuran | Fungsi di Auralis | Wajib / Opsional | Sumber |
|-------|--------|-------------------|------------------|--------|
| **tinyFaceDetector** | ~200 KB | Deteksi wajah real-time (wajah harus ada di kamera) | **Wajib** | face-api.js |
| **faceLandmark68Net** (atau tiny) | ~350 KB | Deteksi 68 titik landmark wajah (mata, mulut, alis) | **Wajib** | face-api.js |
| **faceExpressionNet** | **310 KB** | Pengenalan emosi (Happy, Sad, Neutral, Angry, Surprised, Fearful, Disgusted) → kita mapping ke 4 emosi utama: Senang, Sedih, Netral, Bingung | **Wajib** | face-api.js |
| **Custom MobileNetV2** (fine-tuned) | < 5 MB | Versi optimized khusus anak Indonesia (akurasi lebih tinggi) | **Opsional (Tahap 2)** | Kamu buat sendiri |

**Catatan penting**:
- Semua model di atas **pre-trained** dan berjalan **100% di browser** (client-side).
- Tidak perlu training dari nol untuk MVP.
- Total ukuran semua model ≈ **1 MB** → sangat ringan bahkan di HP.
- Untuk Tahap 1 (MVP): Pakai 3 model face-api.js saja.
- Untuk Tahap 2 (Finish 100% premium): Tambah custom model yang sudah di-fine-tune dengan dataset FERAC + data lokal Indonesia.

### 2. Tech Stack Lengkap (100% Gratis)

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **AI/ML**: face-api.js + @tensorflow/tfjs
- **Speech**: Web Speech API (SpeechRecognition + SpeechSynthesis)
- **State Management**: Zustand (lebih ringan daripada Redux)
- **Animasi**: Lottie + Framer Motion (untuk efek ramah anak)
- **Storage**: LocalStorage / IndexedDB (untuk riwayat sesi)
- **Hosting**: Vercel / Netlify (gratis)

### 3. Fitur yang Harus Ada untuk Finish 100%

**Core Features (Wajib)**
1. Kamera real-time + face detection
2. Emotion recognition (4 emosi utama + confidence score)
3. Speech recognition (Bahasa Indonesia – kata sederhana)
4. Text-to-Speech (suara ramah, pelan, positif)
5. Rule-based Logic Engine + Konteks Sesi (state machine)
6. Sistem sesi lengkap: Pembukaan → Warm-up → Latihan Utama → Review → Penutup
7. Level kesulitan otomatis (naik/turun)
8. UI ramah anak (warna cerah, font besar, animasi positif, confetti reward)
9. Tombol darurat: Ulangi, Istirahat, Akhiri Sesi
10. Progress & poin reward

**Fitur Pendukung (Finish 100%)**
- Mode Fullscreen
- Riwayat sesi (disimpan lokal)
- Nama anak personalisasi
- Dark/Light mode (tapi default mode cerah)
- PWA (bisa di-install di HP seperti aplikasi)
- Error handling (kamera tidak diizinkan, model gagal load, dll)

### 4. Folder Structure Final (Rekomendasi)

```
auralis/
├── public/
│   └── models/                  ← tinyFaceDetector, faceLandmark68Net, faceExpressionNet
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── CameraFeed.jsx
│   │   ├── EmotionDisplay.jsx
│   │   ├── VoiceFeedback.jsx
│   │   ├── SessionHeader.jsx
│   │   └── RewardAnimation.jsx
│   ├── features/
│   │   ├── emotion/
│   │   ├── speech/
│   │   ├── session/             ← konteks sesi + state machine
│   │   └── logic/               ← rule-based engine
│   ├── hooks/
│   ├── utils/
│   ├── pages/
│   │   └── AuralisApp.jsx
│   ├── App.jsx
│   └── main.jsx
├── tailwind.config.js
├── vite.config.js
└── package.json
```

### 5. Langkah Implementasi Menuju 100% (Urut dari Sekarang)

**Tahap 0 (Sekarang – Setup Dasar)**
- Buat project React Vite bersih (`auralis-react`)
- Install: `face-api.js`, `@tensorflow/tfjs`, `zustand`, `tailwindcss`, `lucide-react`, `framer-motion`

**Tahap 1 (MVP – 1 minggu)**
- Load 3 model face-api.js
- Tampilkan webcam + real-time emotion detection
- Tambah Speech Recognition & Synthesis
- Buat UI dasar + animasi

**Tahap 2 (Logic & Sesi – 1–2 minggu)**
- Buat State Machine + Konteks Sesi
- Implementasikan Rule-based Logic Engine
- Buat alur sesi lengkap (6 tahap)

**Tahap 3 (Polish & UX Anak Autis – 1 minggu)**
- Animasi reward, confetti, efek positif
- Tombol darurat besar
- Testing dengan anak (jika memungkinkan)

**Tahap 4 (Finish 100% – Optimasi)**
- PWA setup
- Custom model (opsional)
- Performance optimization (quantization model)
- Deploy ke Vercel/Netlify
- Buat dokumentasi pengguna untuk orang tua/terapis

### 6. Non-Functional Requirements (Harus Dipenuhi)

- Real-time (< 800 ms respons)
- Privasi 100% (tidak ada data dikirim ke server)
- Ringan di HP kelas menengah
- Bahasa Indonesia penuh
- Aksesibilitas tinggi (kontras, font besar)
- Offline capable