Tempatkan model TensorFlow.js custom di folder ini.

File minimum yang diharapkan loader:
- `model.json`
- file weight shards yang direferensikan oleh `model.json`

Konvensi output model saat ini:
- 4 kelas berurutan: `happy`, `sad`, `neutral`, `confused`
- input gambar wajah ukuran `64x64`

Jika file `model.json` belum ada, aplikasi otomatis fallback ke model ekspresi default dari `face-api.js`.
