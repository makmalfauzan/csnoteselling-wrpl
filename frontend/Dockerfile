# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Create tailwind config if not exists
RUN if [ ! -f tailwind.config.js ]; then \
    npx tailwindcss init; \
    fi

# Build CSS first time
RUN npx tailwindcss -i ./src/input.css -o ./src/output.css --minify

# Expose port
EXPOSE 8080

# Command to serve and watch
CMD ["sh", "-c", "npx tailwindcss -i ./src/input.css -o ./src/output.css --watch & npx http-server -p 8080 -c-1 --cors"]