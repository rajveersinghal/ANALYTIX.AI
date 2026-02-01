# 🧠 ANALYTIX.AI: Decision Intelligence System

**Version 5.0 (Production Edition)**

An automated, robust, and explainable Data Science platform that transforms raw tabular data into actionable business decisions. Built for production environments with enterprise-grade error handling, automated optimization, and comprehensive diagnostics.

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

## 🚀 Key Features

### 1. Analytical Engine (The Core)
- **Universal Ingestion**: Seamlessly handles CSV/XLSX with intelligent auto-type detection
- **Robust Cleaning**: Automated missing value imputation, skewness correction, and outlier-safe scaling
- **🔥 Precision Mode**: Recursive Feature Elimination (RFE) for accuracy-driven feature selection
- **Industrial Tuning**: Automated hyperparameter optimization via `RandomizedSearchCV`
- **Safety Layer**: Global `@safe_execution` decorator prevents crashes

### 2. Intelligence Hub (The Brain)
- **Experiment Tracking**: Persistent experiment logging with CSV-based history
- **Drift Detection**: Production safety monitoring using Population Stability Index (PSI)
- **🔬 Diagnostic Audit**: Error analysis, segment-level performance monitoring, and bias detection
- **Explainability 2.0**: Global (SHAP) and local (Permutation) importance for model transparency

### 3. Production Features
- **Docker Support**: Containerized deployment with docker-compose
- **CI/CD Pipeline**: Automated testing and deployment with GitHub Actions
- **Comprehensive Testing**: Unit and integration tests with pytest
- **Configuration Management**: Environment-based settings with `.env` support
- **Professional Documentation**: API docs, deployment guide, and architecture documentation

## 📁 Project Structure

```
ANALYTIX.AI/
├── src/                          # Source code
│   ├── core/                     # Core ML pipeline
│   │   ├── data_loader.py        # Data ingestion
│   │   ├── cleaning.py           # Data cleaning
│   │   ├── features.py           # Feature engineering
│   │   ├── modeling.py           # Model training
│   │   └── ...                   # Other core modules
│   ├── intelligence/             # Intelligence layer
│   │   ├── dashboard.py          # Analytics dashboard
│   │   ├── experiment_tracker.py # Experiment logging
│   │   ├── report_generator.py   # Report generation
│   │   └── ...                   # Other intelligence modules
│   └── app.py                    # Main Streamlit application
├── tests/                        # Test suite
│   ├── unit/                     # Unit tests
│   └── integration/              # Integration tests
├── config/                       # Configuration files
│   ├── settings.py               # Application settings
│   └── logging_config.py         # Logging configuration
├── data/                         # Data directory
│   ├── raw/                      # Raw uploaded data
│   ├── processed/                # Processed datasets
│   └── models/                   # Saved models
├── logs/                         # Application logs
├── docs/                         # Documentation
│   ├── API.md                    # API documentation
│   ├── DEPLOYMENT.md             # Deployment guide
│   └── ARCHITECTURE.md           # System architecture
├── scripts/                      # Utility scripts
│   ├── setup.sh                  # Setup script (Unix)
│   └── setup.bat                 # Setup script (Windows)
├── .github/workflows/            # CI/CD pipelines
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose configuration
├── pyproject.toml                # Project metadata
├── requirements.txt              # Production dependencies
├── requirements-dev.txt          # Development dependencies
└── README.md                     # This file
```

## 🛠️ Installation & Usage

### Quick Start (Local)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ANALYTIX.AI
   ```

2. **Run setup script**
   ```bash
   # Unix/Linux/Mac
   bash scripts/setup.sh
   
   # Windows
   scripts\setup.bat
   ```

3. **Launch the application**
   ```bash
   streamlit run src/app.py
   ```

4. **Access the application**
   - Open your browser to `http://localhost:8501`

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access at http://localhost:8501

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Manual Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Run application
streamlit run src/app.py
```

## 📊 Workflow

1. **Data Upload**: Upload CSV/Excel file
2. **Quality Check**: Automated data quality assessment
3. **Data Cleaning**: Automated preprocessing and cleaning
4. **EDA**: Exploratory data analysis with visualizations
5. **Feature Engineering**: Automated feature selection and engineering
6. **Model Training**: Train and compare multiple models
7. **Insights**: Generate insights, reports, and recommendations

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test suite
pytest tests/unit/
pytest tests/integration/
```

## 📚 Documentation

- [API Documentation](docs/API.md) - Detailed API reference
- [Deployment Guide](docs/DEPLOYMENT.md) - Deployment instructions
- [Architecture](docs/ARCHITECTURE.md) - System architecture
- [Contributing](CONTRIBUTING.md) - Contribution guidelines

## 🔧 Configuration

Configuration is managed through environment variables. Copy `.env.example` to `.env` and update:

```env
DATABASE_URL=sqlite:///data/analytix.db
MODEL_RANDOM_STATE=42
MODEL_TEST_SIZE=0.2
LOG_LEVEL=INFO
```

## 🚀 Production Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions for:
- AWS EC2
- Azure Container Instances
- Google Cloud Run
- Docker/Kubernetes

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License.

## 🏆 Technical Highlights

- **Type Safety**: Comprehensive type hints across all functions
- **Documentation**: Google-style docstrings with Args/Returns/Examples
- **Error Resilience**: Global exception handling with graceful degradation
- **Performance**: Parallel processing (`n_jobs=-1`) for CPU-intensive operations
- **Reproducibility**: Fixed random seeds and dataset fingerprinting
- **Code Quality**: Black formatting, pylint linting, mypy type checking
- **Testing**: 80%+ test coverage with pytest

---

**Developed with ❤️ by ANALYTIX.AI Team** | Production-Ready ML Platform

