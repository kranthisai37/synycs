FROM python:3.10-slim
WORKDIR /app

# Install system dependencies (ffmpeg is typically required for Wav2Lip and video processing)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    libgl1 \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose Django port
EXPOSE 8000

# Run Django development server (can be changed to gunicorn for production)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
