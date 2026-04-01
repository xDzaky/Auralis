# Manual Testing Checklist Auralis

## Prasyarat
- Jalankan `npm run dev`.
- Buka aplikasi di Chrome atau Edge desktop.
- Pastikan perangkat memiliki kamera dan mikrofon aktif.

## Smoke Test Utama
- Landing page tampil tanpa error.
- Input nama anak bisa diisi dan tombol mulai aktif.
- Pemilihan jenis sesi, difficulty, dan reward bisa diubah.
- Riwayat sesi lokal muncul setelah setidaknya satu sesi selesai.

## Permission Test
- Saat masuk sesi pertama kali, browser meminta izin kamera dan mikrofon.
- Jika izin diberikan, video tampil dan status mikrofon menjadi siap.
- Jika izin ditolak, aplikasi menampilkan pesan error yang jelas.

## Session Flow
- Sesi berjalan berurutan: `opening -> warmup -> training -> closing -> review`.
- Tombol `Ulangi` mengulang instruksi terakhir.
- Tombol `Istirahat` memindahkan sesi ke status pause dan `Lanjut Main` mengembalikan ke training.
- Tombol `Akhiri Sesi` tetap membawa user ke fase penutup lalu review.
- Shortcut keyboard berfungsi: `F` fullscreen, `R` ulangi, `P` pause/resume, `E` akhiri sesi.

## Emotion Detection
- Wajah terdeteksi saat kamera aktif.
- Badge emosi tampil saat wajah terlihat jelas.
- Pada mode `Tebak Emosi`, target emosi berubah setelah jawaban benar.
- Pada mode `Cermin Emosi`, feedback pujian muncul saat ekspresi cukup jelas.

## Speech Test
- Pada mode `Cerita Emosi`, status mikrofon aktif muncul.
- Ucapkan kata seperti `senang`, `sedih`, `biasa`, atau `bingung`.
- Transcript terakhir muncul di panel bantuan.
- Feedback suara dan visual muncul setelah speech dikenali.

## Closing & Review
- Setelah target selesai atau sesi diakhiri manual, fase `closing` tampil lebih dulu.
- Halaman review menampilkan poin, jumlah latihan, durasi, insight emosi, dan riwayat lokal.
- Difficulty bisa naik saat beberapa target berhasil beruntun dan bisa turun saat anak beberapa kali kesulitan.

## Custom Model Slot
- Tanpa `public/models/custom-emotion/model.json`, aplikasi tetap berjalan dengan fallback `face-api.js`.
- Jika model custom valid ditambahkan, status berubah menjadi `Custom TFJS aktif`.

## PWA & Offline
- Build production meregistrasikan service worker.
- Setelah halaman sempat dibuka online, refresh ulang masih bisa membuka shell dasar aplikasi saat koneksi dimatikan.
- Manifest aplikasi terbaca dan browser menandai app sebagai installable.

## Regression Build
- Jalankan `npm run build`.
- Jalankan `npm run test:run`.
