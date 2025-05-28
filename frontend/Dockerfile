# Stage 1: Build Tailwind CSS
FROM node:18-alpine AS builder

WORKDIR /app

# Salin semua file frontend
COPY . .

# Install Tailwind CSS CLI
RUN npm install -D tailwindcss

# Build output.css ke src/output.css (sesuai perintah kamu)
RUN npx tailwindcss -i ./src/input.css -o ./src/output.css --minify

# Stage 2: Serve via NGINX
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Hapus default index.html
RUN rm -rf ./*

# Salin file hasil build
COPY --from=builder /app/index.html .
COPY --from=builder /app/src/output.css ./src/output.css
COPY --from=builder /app/script ./script
COPY --from=builder /app/src ./src
COPY --from=builder /app/pages ./pages
COPY --from=builder /app/assets ./assets

# Salin juga folder lain jika kamu punya gambar, font, dsb.
# COPY --from=builder /app/assets ./assets

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
