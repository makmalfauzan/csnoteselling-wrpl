# Stage 1: Build Tailwind CSS
FROM node:18-alpine AS builder

WORKDIR /app
COPY . .

RUN npm install -D tailwindcss
RUN npx tailwindcss -i ./src/input.css -o ./src/output.css --minify

# Stage 2: Serve via NGINX with reverse proxy to backend
FROM nginx:alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

# Copy hasil build
COPY --from=builder /app/index.html .
COPY --from=builder /app/src ./src
COPY --from=builder /app/script ./script
COPY --from=builder /app/pages ./pages
COPY --from=builder /app/assets ./assets

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
