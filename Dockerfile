# Production Dockerfile for AnalytixAI Full-Stack
# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Backend + Final Image
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies for ML libraries
RUN apt-get update && apt-get install -y \
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

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create storage directories
RUN mkdir -p storage/datasets storage/models storage/reports logs

# Set Environment Variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Expose Port
EXPOSE 8000

# Start Application
# Note: We serve the frontend static files via FastAPI in production for simplicity
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
