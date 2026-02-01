# Deployment Guide

## Local Deployment

### Prerequisites
- Python 3.9 or higher
- pip package manager

### Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd ANALYTIX.AI
   ```

2. **Create Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env file with your settings
   ```

5. **Run Application**
   ```bash
   streamlit run src/app.py
   ```

6. **Access Application**
   - Open browser to `http://localhost:8501`

---

## Docker Deployment

### Prerequisites
- Docker installed
- Docker Compose installed

### Steps

1. **Build Docker Image**
   ```bash
   docker build -t analytix-ai:latest .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access Application**
   - Open browser to `http://localhost:8501`

4. **View Logs**
   ```bash
   docker-compose logs -f
   ```

5. **Stop Application**
   ```bash
   docker-compose down
   ```

---

## Cloud Deployment

### AWS EC2

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.medium or larger
   - Security Group: Allow port 8501

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Docker**
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose -y
   sudo usermod -aG docker ubuntu
   ```

4. **Clone and Deploy**
   ```bash
   git clone <repository-url>
   cd ANALYTIX.AI
   docker-compose up -d
   ```

### Azure Container Instances

1. **Build and Push Image**
   ```bash
   docker build -t analytix-ai:latest .
   docker tag analytix-ai:latest <registry>/analytix-ai:latest
   docker push <registry>/analytix-ai:latest
   ```

2. **Deploy to ACI**
   ```bash
   az container create \
     --resource-group myResourceGroup \
     --name analytix-ai \
     --image <registry>/analytix-ai:latest \
     --ports 8501 \
     --dns-name-label analytix-ai
   ```

### Google Cloud Run

1. **Build and Push to GCR**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/analytix-ai
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy analytix-ai \
     --image gcr.io/PROJECT-ID/analytix-ai \
     --platform managed \
     --port 8501 \
     --allow-unauthenticated
   ```

---

## Production Considerations

### Environment Variables
Set these in production:
- `MODEL_RANDOM_STATE`: Random seed for reproducibility
- `MODEL_TEST_SIZE`: Test set size (default: 0.2)
- `LOG_LEVEL`: Logging level (INFO, DEBUG, ERROR)
- `DATABASE_URL`: Database connection string

### Security
- Use HTTPS in production
- Set up authentication if needed
- Restrict file upload sizes
- Implement rate limiting

### Monitoring
- Set up application monitoring
- Configure log aggregation
- Monitor resource usage
- Set up alerts for errors

### Scaling
- Use load balancer for multiple instances
- Consider using Kubernetes for orchestration
- Implement caching where appropriate
- Optimize model loading

---

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port 8501
lsof -i :8501  # Linux/Mac
netstat -ano | findstr :8501  # Windows

# Kill the process or use different port
streamlit run src/app.py --server.port=8502
```

**Import Errors**
```bash
# Ensure you're in the project root
cd ANALYTIX.AI

# Reinstall dependencies
pip install -r requirements.txt
```

**Memory Issues**
- Increase Docker memory limits
- Use smaller datasets for testing
- Optimize feature engineering settings
