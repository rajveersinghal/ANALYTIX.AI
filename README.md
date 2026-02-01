# ANALYTIX.AI 🧠

**AI-Powered Analytics Platform** - Transform your data into actionable insights with automated machine learning and intelligent analytics.

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- MongoDB 6.0+
- Node.js 16+ (for frontend development)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/ANALYTIX.AI.git
cd ANALYTIX.AI

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# Start MongoDB
mongod --dbpath /data/db

# Start backend
uvicorn backend.main:app --reload --port 8000

# Start frontend (in new terminal)
cd frontend
python -m http.server 8080
```

**Access Application**: http://localhost:8080

---

## 📁 Project Structure

```
ANALYTIX.AI/
├── backend/              # FastAPI Backend
│   ├── api/             # REST API endpoints
│   ├── services/        # Business logic
│   ├── models/          # Pydantic schemas
│   ├── db/              # Database models
│   └── main.py          # Application entry
│
├── frontend/            # Web Frontend
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript
│   └── *.html          # Pages
│
├── core/                # Shared Core Modules
│   ├── data/           # Data processing
│   ├── ml/             # Machine learning
│   ├── intelligence/   # AI features
│   └── utils/          # Utilities
│
├── streamlit_app/       # Optional Streamlit UI
├── data/                # Sample datasets
├── docs/                # Documentation
└── tests/               # Test suites
```

---

## ✨ Features

### 🎯 Core Capabilities
- **Automated ML**: Train models with one click
- **Smart Data Cleaning**: Auto-detect and fix data issues
- **Feature Engineering**: Intelligent feature creation
- **Model Explainability**: SHAP-based interpretations
- **Real-time Predictions**: Fast inference API

### 🧠 Intelligence Features
- **Intent Detection**: Understand user goals
- **Smart Recommendations**: Data-driven insights
- **Auto-generated Reports**: Comprehensive analytics
- **What-If Analysis**: Scenario modeling

### 🔐 Enterprise Ready
- **JWT Authentication**: Secure user management
- **MongoDB Integration**: Scalable data storage
- **RESTful API**: 35+ endpoints
- **Trial Management**: 14-day free trial system

---

## 📚 Documentation

- **[API Documentation](http://localhost:8000/docs)** - Interactive Swagger UI
- **[Setup Guide](docs/SETUP.md)** - Detailed installation
- **[Architecture](docs/ARCHITECTURE.md)** - System design
- **[Contributing](CONTRIBUTING.md)** - Development guide

---

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database with Beanie ODM
- **Scikit-learn** - Machine learning
- **SHAP** - Model explainability
- **Pandas** - Data manipulation

### Frontend
- **HTML/CSS/JavaScript** - Modern web stack
- **Fetch API** - REST client
- **Responsive Design** - Mobile-friendly

### Optional
- **Streamlit** - Advanced analytics UI
- **Docker** - Containerization
- **Nginx** - Production deployment

---

## 🔧 Configuration

### Environment Variables

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=analytix_ai_prod

# Security
SECRET_KEY=your-secret-key-min-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:8080

# File Upload
MAX_UPLOAD_SIZE=104857600  # 100MB
```

---

## 🧪 Testing

```bash
# Run all tests
pytest

# Run specific test suite
pytest tests/backend/
pytest tests/core/

# With coverage
pytest --cov=backend --cov=core
```

---

## 📦 Deployment

### Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment guide.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- FastAPI for the excellent framework
- MongoDB for scalable database
- Scikit-learn for ML capabilities
- SHAP for model interpretability

---

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/ANALYTIX.AI/issues)
- **Email**: support@analytix.ai

---

**Made with ❤️ by the ANALYTIX.AI Team**
