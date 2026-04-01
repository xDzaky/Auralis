**Langkah-langkah Fine-Tuning Model Emotion Recognition untuk Auralis**  
**(Versi Khusus Anak Indonesia – Target Akurasi 82–88 %)**

Fine-tuning ini dilakukan di **Tahap 2** (setelah MVP menggunakan face-api.js default). Tujuannya adalah mengganti model default yang bias ke data Barat/dewasa menjadi model yang lebih akurat untuk anak Indonesia (usia 5–12 tahun, warna kulit sawo matang, ekspresi halus, pencahayaan tropis).

Proses ini menggunakan **MobileNetV2** (atau EfficientNet-Lite) karena ringan, cocok untuk browser, dan sudah terbukti sukses di studi anak autis Asia. Semua training dilakukan di Python (laptop/PC biasa), kemudian model di-convert ke TensorFlow.js agar tetap jalan on-device di Auralis.

Berikut **langkah demi langkah** secara lengkap dan logis:

### Langkah 1: Persiapan & Pengumpulan Dataset (1–2 minggu)
- Kumpulkan dataset khusus anak Indonesia (minimal 1.000–2.000 gambar per emosi).
- Sumber awal (gratis & etis):
  - FERAC Dataset (770 gambar anak autis Asia).
  - FER-Autism Dataset (Mendeley 2025).
  - Dataset lokal dari paper Indonesia (YOLOv8 toddler expression atau studi ASD Jawa Timur).
- Tambah data baru: Rekam video anak Indonesia di sekolah/terapi Surabaya (dengan izin orang tua & etika medis). Foto hanya wajah, tidak ada identitas.
- Balance 4 kelas utama: Happy, Sad, Neutral, Confused (atau Angry jika diperlukan).
- Lakukan data augmentation: rotasi kecil, ubah brightness/contrast, flip horizontal, adjust skin tone (untuk sawo matang), tambah noise ringan untuk simulasi pencahayaan ruangan Indonesia.

**Mengapa penting?** Dataset default kurang representatif → akurasi turun jadi 65–75 %. Dataset lokal + augmentasi meningkatkan akurasi hingga 15–20 %.

### Langkah 2: Preprocessing Data (1 hari)
- Crop wajah menggunakan face-api.js atau MediaPipe (agar konsisten dengan Auralis).
- Resize semua gambar ke ukuran 64×64 atau 48×48 pixel.
- Normalisasi pixel (range -1 sampai +1).
- Split data: 80 % training, 10 % validation, 10 % testing.
- Gunakan label sederhana: 0 = Happy, 1 = Sad, 2 = Neutral, 3 = Confused.

### Langkah 3: Pilih & Load Base Model (Transfer Learning) (1 hari)
- Ambil MobileNetV2 yang sudah pre-trained di ImageNet (bobot default dari TensorFlow/Keras).
- Freeze hampir semua layer awal (feature extractor) agar tidak merusak pengetahuan umum tentang wajah.
- Ganti hanya “head” (bagian klasifikasi terakhir) menjadi 4 kelas emosi baru.

**Logic:** Layer awal sudah pandai mendeteksi mata, mulut, alis. Kita hanya “ajari ulang” bagian akhir agar fokus pada ekspresi halus anak Indonesia.

### Langkah 4: Training Tahap Pertama – Train Head Only (2–4 hari)
- Training hanya pada layer klasifikasi baru dengan learning rate sedang (0.001).
- Gunakan optimizer Adam + categorical crossentropy.
- Epoch: 10–20, dengan early stopping jika validation loss tidak turun.
- Monitor akurasi & loss di validation set.

**Tujuan:** Model cepat belajar pola emosi baru tanpa mengubah fitur wajah yang sudah bagus.

### Langkah 5: Fine-Tuning Tahap Kedua – Unfreeze Layer (3–7 hari)
- Unfreeze 20–50 layer terakhir dari MobileNetV2 (biasanya dari block ke-100 ke atas).
- Turunkan learning rate sangat kecil (0.00001 atau 1/10 dari tahap sebelumnya) agar tidak merusak bobot awal.
- Training lagi 10–30 epoch.
- Gunakan teknik:
  - Reduce learning rate on plateau.
  - Weight decay / regularization kecil untuk hindari overfitting.
  - Quantization-aware training (supaya model tetap ringan nanti).

**Logic:** Model sekarang “menyesuaikan” diri dengan ciri khas anak Indonesia (mata sipit, senyum tipis, pencahayaan terang) tanpa kehilangan kemampuan umum.

### Langkah 6: Evaluasi & Optimasi (2–3 hari)
- Test di dataset testing khusus anak Indonesia.
- Target metrik:
  - Akurasi ≥ 82–88 %.
  - F1-score seimbang antar kelas (khususnya Sad & Confused yang sering subtle).
  - Confusion matrix untuk lihat error mana yang masih tinggi.
- Jika akurasi masih kurang: tambah data atau augmentasi lebih agresif.
- Optimasi untuk web:
  - Quantization (8-bit) → ukuran model turun jadi < 5 MB.
  - Pruning (hapus bobot kecil) agar lebih cepat di HP.

### Langkah 7: Convert ke TensorFlow.js & Integration ke Auralis (1–2 hari)
- Export model ke format TensorFlow SavedModel.
- Convert menggunakan tensorflowjs_converter → menghasilkan `model.json` + weight files.
- Load model di Auralis (menggantikan face-api.js emotion part).
- Proses inferensi:  
  Kamera → crop wajah → resize → masukkan ke model → output probabilitas 4 emosi + confidence score.
- Jika confidence < 0.60 → sistem anggap “Bingung” dan beri respons ramah “Coba lihat ke kamera lagi ya”.

### Estimasi Waktu & Tools
- Total waktu: 2–4 minggu (untuk tim kecil).
- Tools gratis: Google Colab (GPU gratis), TensorFlow 2.x, Roboflow/Kaggle untuk dataset.
- Biaya: Nol (kecuali kalau butuh cloud GPU berbayar untuk eksperimen cepat).


