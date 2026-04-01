**Augmentasi Dataset Emosi Anak Indonesia**  
**(Untuk Fine-Tuning Model di Project Auralis)**

Augmentasi adalah langkah **wajib** di Tahap 2 fine-tuning karena dataset asli anak Indonesia (atau Asia Tenggara) jumlahnya masih terbatas (FERAC hanya 770 gambar, FER-Autism sekitar 1.420 gambar). Tanpa augmentasi, model mudah overfitting dan akurasinya rendah pada kondisi nyata di Indonesia (pencahayaan terang tropis, kulit sawo matang, ekspresi halus anak, gerakan kepala anak yang dinamis, serta kualitas kamera HP).

Tujuannya: Membuat dataset “palsu” tapi realistis sebanyak 8–10x lipat, sehingga model lebih tahan terhadap variasi dunia nyata dan akurasi bisa naik hingga 15–20 %.

### Mengapa Augmentasi Khusus untuk Anak Indonesia?
- Ekspresi anak Indonesia biasanya **subtle** (senyum tipis, sedih tanpa dramatis).
- Pencahayaan ruangan sekolah/rumah Indonesia: terang, banyak bayangan, warna kuning-warm.
- Warna kulit **sawo matang** → model default sering salah deteksi.
- Anak sering miring kepala, gerak cepat, atau pakai hijab/aksesoris ringan.
- Kamera HP: noise, blur, resolusi rendah.

Augmentasi harus meniru kondisi ini agar model “paham” anak Indonesia, bukan hanya anak Barat.

### Teknik Augmentasi yang Direkomendasikan (Paling Efektif untuk Auralis)

Dibagi menjadi 3 kategori utama (berdasarkan praktik terbaik dari FER-Autism dan paper Asia 2025):

1. **Geometric Transformation** (Ubah bentuk & posisi wajah)  
   - Horizontal flip (mirror) – sangat efektif, tidak merusak ekspresi.  
   - Random rotation (±10° sampai ±15°).  
   - Random translation / shift (geser 10–20 % ke kiri/kanan/atas/bawah).  
   - Random crop + resize (potong sedikit, lalu resize ke 64×64 atau 48×48).  
   - Slight zoom in/out (scale 0.9–1.1).  
   → Ini simulasi anak yang sering menggerakkan kepala.

2. **Color & Lighting Adjustment** (Paling penting untuk Indonesia)  
   - Brightness & contrast adjustment (naik-turun 20–40 %).  
   - Gamma correction (untuk pencahayaan tropis yang terang).  
   - Hue, Saturation, Value (HSV) shift – khususnya saturation rendah agar terlihat natural.  
   - **Skin tone adjustment** (paling krusial):  
     Convert ke LAB color space → ubah hanya channel L (lightness) untuk membuat variasi sawo matang, kecokelatan, atau lebih terang.  
   - Random shadow / highlight (simulasi cahaya jendela atau lampu ruangan).

3. **Noise & Quality Degradation** (Simulasi kamera HP)  
   - Gaussian noise (ringan).  
   - Gaussian blur (sedang).  
   - JPEG compression (quality 70–90 %) – simulasi foto dari HP.  
   - Random erasing (hapus sebagian kecil area wajah, misalnya pipi atau dahi).

**Teknik Advanced (Opsional Tahap Akhir)**  
- Synthetic generation dengan GAN/Diffusion Model (ChildGAN style) untuk buat wajah anak Indonesia baru.  
- Décalcomanie (symmetry flip) untuk ekspresi halus.

### Tools yang Paling Direkomendasikan
- **Albumentations** (paling cepat & fleksibel) → Sudah dipakai di dataset FER-Autism resmi.  
- Alternatif: Imgaug atau torchvision.transforms (kalau pakai PyTorch).  
- Untuk skin tone khusus: OpenCV + LAB color space.

### Langkah-langkah Praktis Augmentasi Dataset
1. **Gabungkan Dataset Dasar**  
   Gabung FERAC + FER-Autism + sebagian East Asian Facial Expression Dataset (fokus anak/remaja Asia Tenggara).

2. **Preprocessing Dasar**  
   - Crop wajah hanya (gunakan face-api.js atau MediaPipe).  
   - Resize ke ukuran input model (64×64 atau 48×48).  
   - Simpan dalam folder per kelas: happy / sad / neutral / confused.

3. **Terapkan Augmentasi**  
   - Setiap gambar asli di-augmentasi **8–10 kali**.  
   - Gunakan pipeline yang sama untuk semua kelas agar tetap balance.  
   - Simpan hasil augmentasi dalam folder terpisah (train_augmented).

4. **Balance & Split**  
   - Pastikan jumlah gambar per kelas hampir sama.  
   - Split: 80 % train, 10 % validation, 10 % test (test jangan di-augmentasi).

5. **Validasi Visual**  
   Lihat 50–100 gambar hasil augmentasi secara manual. Pastikan masih terlihat natural (tidak terlalu aneh atau rusak ekspresinya).

### Parameter Contoh yang Cocok untuk Anak Indonesia
- Rotation: ±10°  
- Brightness: ±25 %  
- Contrast: ±20 %  
- Skin tone (LAB): L channel ±15 %  
- Noise: Gaussian noise dengan variance rendah  
- Total augmentasi per gambar: 10x  
→ Hasil akhir: dari 2.000 gambar asli bisa jadi 20.000+ gambar siap training.

Dengan augmentasi yang tepat ini, model MobileNetV2 akan jauh lebih robust di kondisi Indonesia (akurasinya naik dari ~70 % menjadi 82–88 %).
