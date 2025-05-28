# backend/Dockerfile

FROM python:3.10-slim

WORKDIR /app

COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port Flask
EXPOSE 5000

# Jalankan Flask app
CMD ["python", "app.py"]
