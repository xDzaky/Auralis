**✅ Detail Lengkap Fine-Tuning Model Emotion Recognition untuk Auralis**  
**(Versi Khusus Anak Indonesia – Target Akurasi 82–88 %)**

Berikut adalah panduan **sangat detail** langkah demi langkah untuk fine-tuning model MobileNetV2 menjadi model emotion recognition yang dioptimalkan untuk anak Indonesia (usia 5–12 tahun, ekspresi halus, warna kulit sawo matang, pencahayaan tropis).

**Catatan penting sebelum mulai:**
- Laptop kamu (i3-6006U + 11 GB RAM) **kurang cocok** untuk training (akan sangat lambat).  
  **Rekomendasi kuat**: Gunakan **Google Colab** (GPU gratis).
- Total waktu: 2–4 minggu (tergantung data).
- Model akhir akan di-convert ke TensorFlow.js agar bisa dipakai langsung di browser React Auralis.

### 1. Persiapan Dataset (Sudah Dibahas Sebelumnya)
- Gabungkan: **FERAC** (Bangladesh ASD) + **FER-Autism** (augmented) + data lokal anak Indonesia yang kamu rekam.
- Target: 4 kelas → **Happy, Sad, Neutral, Confused**.
- Folder struktur contoh:
  ```
  dataset/
  ├── train/
  │   ├── happy/
  │   ├── sad/
  │   ├── neutral/
  │   └── confused/
  ├── val/
  └── test/
  ```
- Lakukan augmentasi (Albumentations) seperti yang sudah dijelaskan sebelumnya.

### 2. Setup Environment (Google Colab)
Buat notebook baru di Colab, lalu jalankan:

```python
!pip install tensorflow==2.16.1 albumentations opencv-python pandas matplotlib
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models
import albumentations as A
```

### 3. Load & Preprocess Dataset

```python
IMG_SIZE = 64   # ukuran kecil agar cepat di browser
BATCH_SIZE = 32

# Data augmentation pipeline (khusus anak Indonesia)
augment = A.Compose([
    A.HorizontalFlip(p=0.5),
    A.Rotate(limit=15, p=0.5),
    A.RandomBrightnessContrast(brightness_limit=0.3, contrast_limit=0.3, p=0.7),
    A.GaussNoise(var_limit=(10, 30), p=0.4),
    A.Resize(IMG_SIZE, IMG_SIZE)
])

# Gunakan ImageDataGenerator atau tf.data untuk load
train_ds = tf.keras.utils.image_dataset_from_directory(
    'dataset/train',
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    label_mode='categorical'   # 4 kelas
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    'dataset/val',
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    label_mode='categorical'
)
```

### 4. Bangun Model MobileNetV2 (Transfer Learning)

```python
base_model = MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,          # hapus classifier lama
    weights='imagenet'          # pre-trained ImageNet
)

# Freeze base model di tahap awal
base_model.trainable = False

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.3),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.2),
    layers.Dense(4, activation='softmax')   # 4 kelas emosi
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()
```

### 5. Training Tahap 1 – Train Head Only (Cepat)

```python
history1 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=15,                  # cukup 10–20 epoch
    callbacks=[
        tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=3)
    ]
)
```

### 6. Fine-Tuning Tahap 2 – Unfreeze Beberapa Layer (Paling Penting)

```python
# Unfreeze 50–80 layer terakhir (dari total ~154 layer di MobileNetV2)
base_model.trainable = True

# Freeze layer awal (feature extractor)
for layer in base_model.layers[:100]:   # sesuaikan angka ini
    layer.trainable = False

# Learning rate sangat kecil
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),   # penting!
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

history2 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=30,
    callbacks=[... sama seperti tahap 1 ...]
)
```

**Tips fine-tuning MobileNetV2 (dari paper & tutorial terkini 2025–2026):**
- Learning rate tahap 2: 1e-5 sampai 1e-6.
- Epoch total: 40–60.
- Target akurasi: ≥82 % di validation (FER2013 biasanya hanya 66–68 %, CK+ bisa 92 %+).
- Gunakan `GlobalAveragePooling2D` + Dropout untuk menghindari overfitting.

### 7. Evaluasi & Save Model

```python
model.evaluate(val_ds)   # cek akurasi akhir

# Simpan model Keras
model.save('auralis_emotion_model.h5')
```

### 8. Convert ke TensorFlow.js (Agar Bisa Dipakai di Browser)

Install converter di Colab:

```bash
!pip install tensorflowjs
!tensorflowjs_converter \
    --input_format=keras \
    auralis_emotion_model.h5 \
    ./tfjs_model
```

Hasilnya akan ada folder `tfjs_model/` berisi:
- `model.json`
- Beberapa file `.bin` (weights)

### 9. Integrasi ke Project React Auralis

1. Copy folder `tfjs_model` ke `public/models/` di folder React kamu.
2. Di React component (misalnya `EmotionDetector.jsx`):

```jsx
import * as tf from '@tensorflow/tfjs';
import * as faceapi from 'face-api.js';

await tf.ready();
const model = await tf.loadLayersModel('/models/model.json');

// Kemudian gunakan bersama face-api.js untuk crop wajah → inferensi
```

### 10. Target Akurasi & Performa Akhir
- Akurasi target: **82–88 %** pada anak Indonesia (setelah fine-tuning + data lokal).
- Ukuran model akhir: < 5 MB (setelah quantization).
- Inference time di browser: < 300 ms (bahkan di HP).

**Mau saya berikan sekarang?**
- Notebook Colab lengkap (saya bisa tulis seluruh kode siap copy-paste)
- Atau langsung langkah integrasi ke React (load custom model + replace face-api.js emotion)

Balas saja:
- **“Berikan notebook Colab”** atau
- **“Langsung integrasi ke React”**

Kita bisa lanjut sampai model benar-benar jalan di Auralis-mu. Siap? ✨