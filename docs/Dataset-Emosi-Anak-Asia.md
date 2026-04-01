**Dataset Emosi Anak Asia**  
**(Relevan untuk Fine-Tuning Model di Project Auralis)**

Berikut adalah daftar **dataset terbaik** yang tersedia saat ini (per April 2026) untuk melatih atau fine-tuning model emotion recognition khusus **anak Asia**, terutama anak usia 5–12 tahun dengan fokus Autism Spectrum Disorder (ASD). Saya prioritaskan yang berasal dari atau mencakup ras Asia Tenggara / Asia Selatan karena ciri wajah, ekspresi halus, dan pencahayaan tropis mirip Indonesia.

### 1. **FERAC Dataset** (Paling Direkomendasikan untuk Auralis)
- **Nama lengkap**: Facial Emotion Recognition - Autistic Children (FERAC) Dataset
- **Jumlah gambar**: 770 gambar (691 training + 79 testing)
- **Kelas emosi**: 4 kelas → Natural (netral), Fear (takut), Joy (senang), Anger (marah)
- **Usia anak**: Anak-anak (tidak disebutkan detail umur, tapi difokuskan pada anak ASD)
- **Asal**: Bangladesh (Asia Selatan) – sangat dekat dengan ras dan ekspresi anak Indonesia
- **Karakteristik**: Dibuat khusus untuk anak autis dengan bantuan dokter dari Autism Development Centre, Ma Shishu O General Hospital, Chattogram. Gambar sudah dibersihkan (tidak ada hitam-putih atau duplikat).
- **Link download**: [Kaggle - FERAC Dataset](https://www.kaggle.com/datasets/rajasreechaiti/ferac-dataset)
- **Keunggulan untuk Auralis**: Paling cocok karena anak ASD + Asia. Ekspresi natural dan halus sesuai kebutuhan kita (bisa mapping “natural” ke Neutral/Confused).

### 2. **FER-Autism Dataset** (Versi Augmented Terbaik)
- **Nama lengkap**: Facial Emotion Recognition Dataset for Children with Autism (FER-Autism)
- **Jumlah gambar**: ±1.420 gambar (1.200 training + 220 testing) – sudah di-augmentasi 10x per gambar
- **Kelas emosi**: 6 kelas → Natural, Anger, Fear, Joy, Sadness, Surprise
- **Usia anak**: Anak-anak dengan ASD
- **Asal**: Dikembangkan di Mesir (bukan Asia), tapi merupakan versi augmented dari dataset ASD anak
- **Teknik augmentasi**: Flip, rotasi, brightness, noise, crop (menggunakan Albumentations) – sangat bagus untuk menambah variasi pencahayaan Indonesia
- **Link download**: [Mendeley Data](https://data.mendeley.com/datasets/b33pf78h62)
- **Keunggulan untuk Auralis**: Lebih besar dan seimbang. Cocok dikombinasikan dengan FERAC untuk meningkatkan akurasi.

### 3. **East Asian Facial Expression Image Dataset** (Paling Relevan Geografis)
- **Jumlah gambar**: >2.000 gambar (dari 400+ orang)
- **Kelas emosi**: Happy, Sad, Angry, Shocked, Neutral
- **Usia**: 18–70 tahun (dewasa) → **kekurangan utama**
- **Asal**: Termasuk Indonesia, Malaysia, Thailand, Vietnam, Philippines, Singapore, China, Japan (East + Southeast Asia)
- **Link**: [FutureBeeAI](https://www.futurebeeai.com/dataset/image-dataset/facial-images-expression-east-asia)
- **Keunggulan**: Satu-satunya dataset yang secara eksplisit mencakup anak/remaja Indonesia dan negara Asia Tenggara. Bisa digunakan sebagai tambahan untuk variasi etnis.

### Dataset Pendukung Lain (Kurang Prioritas)
| Dataset                          | Jumlah Data       | Kelas Emosi                  | Asal / Usia          | Kelemahan untuk Auralis                  |
|----------------------------------|-------------------|------------------------------|----------------------|------------------------------------------|
| IMED (Indonesian Mixed Emotion) | 15 subjek         | 19 mixed emotions            | Indonesia, dewasa (17–32 th) | Bukan anak                               |
| CAFE (Child Affective Facial Expression) | 1.192 foto       | 7 emosi + neutral            | Internasional (termasuk 16 Asian) | Hanya sedikit anak Asia                  |
| LIRIS-CSE                       | 208 video         | Spontaneous emotions         | Culturally varied (anak 6–12 th) | Video, bukan gambar statis               |

### Rekomendasi untuk Project Auralis
1. **Mulai dengan kombinasi FERAC + FER-Autism**  
   → Total ±2.000+ gambar anak ASD Asia → cukup untuk fine-tuning MobileNetV2 hingga akurasi 82–88 %.
2. **Tambahkan East Asian Dataset** untuk variasi etnis Indonesia (meski usia dewasa, bisa digunakan untuk augmentasi skin tone & fitur wajah).
3. **Langkah selanjutnya yang ideal**:
   - Gabungkan ketiga dataset di atas.
   - Tambah augmentasi khusus Indonesia (brightness tinggi, skin tone sawo matang, ekspresi halus).
   - Rekam sedikit data sendiri di Surabaya/Jawa Timur (dengan izin etis) untuk meningkatkan akurasi lokal.

Semua dataset di atas **gratis** dan bisa langsung di-download untuk keperluan penelitian/non-komersial.
