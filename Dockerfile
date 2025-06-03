# Gunakan base image Node.js versi LTS (Long Term Support) dengan varian Alpine Linux yang ringan
FROM node:18-alpine

# Set direktori kerja di dalam container
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Instal dependensi proyek
RUN npm install

# Salin semua file dan folder proyek ke direktori kerja di dalam container
COPY . .

# Expose port yang digunakan oleh aplikasi (misalnya port 3000)
EXPOSE 3000

# Perintah untuk menjalankan aplikasi saat container dimulai
CMD [ "node", "csnoteselling-wrpl.js" ]