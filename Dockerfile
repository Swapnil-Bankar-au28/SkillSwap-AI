FROM python:3.11-slim

# Install minimal system dependencies (LaTeX/texlive removed — Manim is disabled on cloud)
# Cache bust: v4 - removed CORSMiddleware import, clean rebuild forced
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    pkg-config \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create writable outputs directory
RUN mkdir -p /tmp/outputs

# Expose port (Render sets the PORT environment variable)
EXPOSE 8000

# Start the FastAPI server using uvicorn
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
