# Stage 1: Build Tailwind CSS
FROM node:18-alpine AS builder
WORKDIR /app

COPY . .
RUN npm install -D tailwindcss
RUN npx tailwindcss -i ./src/input.css -o ./src/output.css --minify

# Stage 2: Serve with NGINX and reverse proxy to backend
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Hapus index default
RUN rm -rf ./*

# Salin file frontend dari builder
COPY --from=builder /app/index.html .
COPY --from=builder /app/pages ./pages
COPY --from=builder /app/script ./script
COPY --from=builder /app/src ./src
COPY --from=builder /app/assets ./assets

# Salin nginx config
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
