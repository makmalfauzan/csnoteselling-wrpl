# Stage 1: Build Tailwind CSS
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json + package-lock.json dulu
COPY package*.json ./

RUN npm install -D tailwindcss

# Copy semua file frontend (karena konteks di folder frontend)
COPY . .

# Build Tailwind CSS output.css
RUN npx tailwindcss -i ./src/input.css -o ./src/output.css --minify

# Stage 2: Serve via NGINX
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

# Copy index.html
COPY --from=builder /app/index.html .

# Copy folder pages
COPY --from=builder /app/Pages ./Pages

# Copy hasil build Tailwind output.css
COPY --from=builder /app/src/output.css ./src/output.css

# Copy folder script (JS)
COPY --from=builder /app/script ./script

# Copy folder assets (gambar, font, dsb)
COPY --from=builder /app/assets ./assets

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
