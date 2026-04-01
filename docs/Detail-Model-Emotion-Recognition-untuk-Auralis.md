**Detail Model Emotion Recognition untuk Auralis**  
**(Versi Khusus Anak Indonesia)**

Berikut adalah penjelasan lengkap dan teknis mengenai **model emotion recognition** yang digunakan di project Auralis, dengan penyesuaian khusus untuk **anak Indonesia** (usia 5–12 tahun, mayoritas ras Asia Tenggara, warna kulit sawo matang, fitur wajah khas Indonesia).

### 1. Model Default yang Digunakan (Tahap Awal)
- **Library utama**: `face-api.js` + **TensorFlow.js** (client-side).
- **Model expression recognition** yang dibundle di face-api.js:
  - Ukuran sangat kecil: ±310 KB (depthwise separable convolutions + densely connected blocks).
  - Arsitektur: CNN ringan (bukan transformer berat).
  - Emosi yang dideteksi (7 kelas standar):
    - Happy (senang)
    - Sad (sedih)
    - Neutral (netral)
    - Angry (marah)
    - Fearful (takut)
    - Disgusted (jijik)
    - Surprised (terkejut)
- Untuk Auralis kita **fokus hanya pada 4 emosi utama** sesuai kebutuhan NeuroAid asli:
  - Happy
  - Sad
  - Neutral
  - Confused/Bingung (kita mapping dari “neutral + low confidence” atau tambah class custom).

**Kelebihan default**:
- Real-time di browser (bahkan di HP kelas menengah).
- Tidak perlu server.
- Sudah termasuk face detection + landmark 68 titik.

### 2. Keterbatasan Model Default untuk Anak Indonesia
Model face-api.js dilatih pada campuran dataset umum (FER2013, CK+, web-scraped) yang mayoritas:
- Dewasa (bukan anak-anak).
- Ras Kaukasia / Barat.
- Ekspresi “dramatis” (bukan ekspresi halus anak Indonesia).

Akibatnya:
- Akurasi turun signifikan pada anak Asia Tenggara (mata lebih sipit, hidung lebih rata, kulit lebih gelap).
- Ekspresi anak Indonesia sering **lebih subtle** (senyum tipis, sedih tanpa air mata dramatis).
- Pencahayaan tropis Indonesia (cahaya terang + bayangan) sering mengganggu.
- Akurasi default diperkirakan hanya **65–75 %** untuk anak Indonesia (berdasarkan pola paper serupa di Asia).

### 3. Rekomendasi Model yang Dioptimalkan untuk Anak Indonesia
Kita tidak menggunakan model default selamanya. **Strategi jangka panjang** adalah **fine-tuning / custom model** yang disesuaikan dengan anak Indonesia.

#### Model Target yang Direkomendasikan:
- **Arsitektur**: MobileNetV2 atau EfficientNet-Lite (ringan, cocok browser).
- **Base**: TensorFlow.js (convert dari Python model).
- **Emosi fokus**: Happy, Sad, Neutral, Confused (4 class) + optional Angry.
- **Input**: 48×48 atau 64×64 grayscale + RGB (face crop dari face-api.js).
- **Output**: Probabilitas 4 emosi + confidence score.

#### Cara Mendapatkan Data Training Khusus Indonesia
Dataset publik yang paling mendekati (bisa digunakan sebagai starting point):
- **FERAC Dataset** (Kaggle) → 770 gambar anak autis (Bangladesh) dengan emosi natural, fear, joy, anger.
- **FER-Autism** (Mendeley 2025) → Dataset augmented khusus anak autis.
- Dataset lokal Indonesia yang sudah ada di paper:
  - Studi YOLOv8 toddler facial expression (Indonesia, 2025).
  - Dataset ASD facial images dari penelitian Indonesia (2.940 gambar anak 2–14 tahun).

**Rencana ideal**:
1. Ambil dataset di atas sebagai base.
2. Tambah data baru dari anak Indonesia (dengan izin etis dari sekolah/terapis di Surabaya atau Jawa Timur).
3. Data augmentation: rotasi, brightness, contrast, skin tone adjustment (untuk sawo matang).
4. Fine-tune model selama 20–50 epoch.

### 4. Implementasi Teknis di Auralis (Client-Side)
- **Tahap 1 (MVP)**: Pakai face-api.js default + mapping emosi sederhana.
- **Tahap 2 (Optimized)**:
  - Load custom model TensorFlow.js (`model.json` + weights).
  - Proses: 
    1. face-api.js → deteksi wajah + crop.
    2. Resize ke 64×64.
    3. Masukkan ke custom MobileNetV2 classifier.
    4. Output: array probabilitas + label dominan + confidence.
- Semua tetap **on-device** (tidak kirim gambar ke server).
- Ukuran model target: < 5 MB agar cepat dimuat di HP.

### 5. Metrik Target yang Diinginkan
- Akurasi minimal: **82–88 %** pada anak Indonesia (setelah fine-tuning).
- Real-time: < 300 ms per frame.
- Confidence threshold: Jika < 0.60 → anggap “bingung” dan minta anak ulangi dengan ramah.
- Testing: Cross-validation dengan data anak Indonesia (bukan hanya dataset Barat).

### 6. Keuntungan Custom Model untuk Anak Indonesia
- Akurasi jauh lebih tinggi pada ekspresi halus anak lokal.
- Lebih tahan terhadap pencahayaan ruangan sekolah Indonesia.
- Mengurangi bias budaya (ekspresi “senang” di Indonesia sering tidak terlalu lebar).
- Memberi rasa “lebih mengerti” anak → meningkatkan kepercayaan dan engagement.

### 7. Tantangan & Solusi
- Tantangan: Mengumpulkan dataset etis (butuh izin orang tua & IRB).
- Solusi: Mulai dengan dataset publik Asia + augmentasi, lalu tambah data sendiri secara bertahap.
- Tantangan: Model lebih besar sedikit memengaruhi performa HP.
- Solusi: Quantization (TensorFlow.js quantization) agar tetap ringan.
