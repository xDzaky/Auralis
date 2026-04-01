# Auralis Emotion Model Training

Folder ini menyiapkan fondasi Tahap 2 untuk fine-tuning model emosi anak Indonesia.

## Isi
- `requirements.txt`: dependency Python dasar untuk training dan convert.
- `train_emotion_model.py`: script training MobileNetV2 berbasis struktur folder dataset.
- `convert_to_tfjs.sh`: helper convert model Keras `.h5` ke format TensorFlow.js.

## Struktur dataset yang diharapkan

```text
dataset/
├── train/
│   ├── happy/
│   ├── sad/
│   ├── neutral/
│   └── confused/
├── val/
│   ├── happy/
│   ├── sad/
│   ├── neutral/
│   └── confused/
└── test/
    ├── happy/
    ├── sad/
    ├── neutral/
    └── confused/
```

## Contoh langkah lokal / Colab

```bash
pip install -r ml/requirements.txt
python ml/train_emotion_model.py --dataset ./dataset --output ./artifacts/auralis_emotion_model.h5
bash ml/convert_to_tfjs.sh ./artifacts/auralis_emotion_model.h5 ./public/models/custom-emotion
```

## Catatan
- Script ini adalah scaffold praktis awal, bukan pipeline riset penuh.
- Augmentasi lanjutan, evaluasi confusion matrix, dan quantization bisa ditambahkan pada iterasi berikutnya.
