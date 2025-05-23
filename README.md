# UTAMAKAN PULL

## Langkah-langkah running:

- conda info --envs <!-- cek info env -->
- conda activate (Nama env) <!-- aktifkan env (yg terinstal flask) -->
- buat 2 terminal
- jalankan live server dari file index.html

### BE (terminal 1):

- cd backend
- run pip install -r requirements.txt <!-- Cek apakah sdh install depedensi untuk backend -->
- python app.py <!-- Jalankan backend -->

### FE (terminal 2):

- cd frontend
- npm install <!--cek apakah dependensi sdh terinstall sesuai package.json  -->
- npm run watch <!-- Jalankan tailwindcss -->

# NOTE:

- Data base sudah terhosting online di railway

# CARA TESTING

## PASTIKAN DATABASE SUDAH SIAP AGAR DATA TESTING TIDAK BERTUBRUKAN

- Pastikan terminal sdh ada di root (/csnoteselling-wrpl)
- run pytest backend/test/(nama file)
- run pytest backend/test (untuk langsung menjalankan semua testing)
