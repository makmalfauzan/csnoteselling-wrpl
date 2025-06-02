# UTAMAKAN PULL

## Langkah-langkah running (Via docker):
- (Pastikan terminal sdh diroot) jalankan docker-compose build --up

# NOTE:

- Data base sudah terhosting online di railway
## add new file .env  
  " DATABASE_URL=mysql://root:YHtIPFbrYOuawzOkzApwjTCatBRzVyDh@centerbeam.proxy.rlwy.net:11729/railway "

# CARA TESTING

## PASTIKAN DATABASE SUDAH SIAP AGAR DATA TESTING TIDAK BERTUBRUKAN

- Pastikan terminal sdh ada di root (/csnoteselling-wrpl)
- run pytest backend/test/(nama file)
- run pytest backend/test (untuk langsung menjalankan semua testing)
