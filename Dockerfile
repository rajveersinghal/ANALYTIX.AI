# Backend-only Dockerfile for AnalytixAI (Render Deployment)
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for ML libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Backend Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY app/ ./app/
COPY README.md .

# Create storage directories
RUN mkdir -p storage/datasets storage/models storage/reports logs

# Set Environment Variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/ping || exit 1

# Start Application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
