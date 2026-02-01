# 🧠 ANALYTIX.AI: Decision Intelligence System

**Version 5.0 (Platform Edition)**

An intelligent, adaptive Data Science platform that transforms raw data into actionable business decisions. Features SaaS-style intent selection, AI-powered recommendations, and guided workflows.

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.28+-FF4B4B.svg)](https://streamlit.io)

## 🚀 Key Features

### 1. Platform Brain (NEW!)
- **🎯 Intent Selection**: Choose your goal - system guides you to the right solution
- **🤖 AI Recommendations**: Analyzes data and suggests optimal workflows
- **✅ Smart Validation**: Checks requirements before starting
- **📊 Confidence Scoring**: Know success probability upfront
- **💡 Contextual Tips**: Smart suggestions based on your data

### 2. Analytical Engine
- **Universal Ingestion**: CSV/XLSX with auto-type detection
- **Robust Cleaning**: Automated preprocessing and outlier handling
- **🔥 Precision Mode**: RFE for accuracy-driven feature selection
- **Industrial Tuning**: Automated hyperparameter optimization
- **Safety Layer**: Global error handling prevents crashes

### 3. Intelligence Hub
- **Experiment Tracking**: Persistent experiment logging
- **Drift Detection**: Production monitoring with PSI
- **🔬 Diagnostic Audit**: Error analysis and bias detection
- **Explainability**: SHAP and permutation importance
- **A/B Testing**: Statistical comparison tools
- **Time Series**: Forecasting and trend analysis

## 📁 Project Structure

```
ANALYTIX.AI/
├── app.py                        # Main Streamlit application
├── src/                          # Source code
│   ├── core/                     # Core ML pipeline
│   │   ├── intent_engine.py      # Intent detection & orchestration
│   │   ├── data_loader.py        # Data ingestion
│   │   ├── cleaning.py           # Data cleaning
│   │   ├── features.py           # Feature engineering
│   │   └── modeling.py           # Model training
│   └── intelligence/             # Intelligence layer
│       ├── intent_recommender.py # AI recommendations
│       ├── dashboard.py          # Analytics dashboard
│       ├── experiment_tracker.py # Experiment logging
│       └── report_generator.py   # Report generation
├── modules/                      # Legacy core modules
├── intelligence/                 # Legacy intelligence modules
├── tests/                        # Test suite
├── config/                       # Configuration
├── data/                         # Data directory
├── docs/                         # Documentation
│   ├── API.md                    # API documentation
│   └── ARCHITECTURE.md           # System architecture
├── .github/                      # GitHub configuration
├── requirements.txt              # Dependencies
└── README.md                     # This file
```

## 🛠️ Installation & Usage

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajveersinghal/ANALYTIX.AI.git
   cd ANALYTIX.AI
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Activate (Windows)
   venv\Scripts\activate
   
   # Activate (Unix/Mac)
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment (optional)**
   ```bash
   cp .env.example .env
   # Edit .env with your preferences
   ```

5. **Launch the application**
   ```bash
   streamlit run app.py
   ```

6. **Access the application**
   - Open your browser to `http://localhost:8501`

### Windows Quick Start

```bash
# Use the provided batch file
run_app.bat
```

## 📊 Workflow

### New SaaS-Style Experience

1. **📂 Data Upload**: Upload CSV/Excel file
2. **🎯 What Do You Want to Do?** (NEW!)
   - AI analyzes your data
   - See top 3 recommended intents
   - Choose from 8 predefined goals:
     - 🎯 Build Predictive Model
     - 📊 Explore & Understand Data
     - 🏥 Data Health Check
     - ⚡ Optimize Existing Model
     - 💡 Understand Model Decisions
     - 📈 Time Series Forecasting
     - ⚖️ A/B Testing & Comparison
     - 🔔 Monitor Model Performance
3. **✅ Validation**: System checks if your data meets requirements
4. **📋 Personalized Pipeline**: See exact steps for your goal
5. **🚀 Guided Execution**: Follow the optimized workflow

### Traditional Workflow (Still Available)

1. Quality Check → 2. Data Cleaning → 3. EDA → 4. Feature Engineering → 5. Model Training → 6. Insights

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
- [Architecture](docs/ARCHITECTURE.md) - System architecture
- [Contributing](CONTRIBUTING.md) - Contribution guidelines

## 🔧 Configuration

Configuration is managed through environment variables. Copy `.env.example` to `.env`:

```env
DATABASE_URL=sqlite:///data/analytix.db
MODEL_RANDOM_STATE=42
MODEL_TEST_SIZE=0.2
LOG_LEVEL=INFO
```

## 🎯 Use Cases

- **Churn Prediction**: Identify customers at risk
- **Sales Forecasting**: Predict future revenue
- **Fraud Detection**: Detect anomalous transactions
- **Price Optimization**: Estimate optimal pricing
- **Customer Segmentation**: Group similar customers
- **Demand Forecasting**: Predict inventory needs
- **A/B Testing**: Compare marketing campaigns

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 🏆 Technical Highlights

- **Platform Brain**: Intent detection with AI-powered recommendations
- **Type Safety**: Comprehensive type hints across all functions
- **Documentation**: Google-style docstrings with examples
- **Error Resilience**: Global exception handling
- **Performance**: Parallel processing for CPU-intensive operations
- **Reproducibility**: Fixed random seeds and fingerprinting
- **Code Quality**: Black formatting, comprehensive testing
- **Modern UX**: SaaS-style guided workflows

## 🌟 What Makes This Different?

### Before (Traditional Tools)
- Upload data → Figure out what to do → Hope it works

### After (ANALYTIX.AI Platform)
- Upload data → **AI recommends best approach** → **Validation before starting** → **Guided workflow** → **Confident results**

---

**Developed with ❤️ by ANALYTIX.AI Team** | Intelligent ML Platform

**Repository**: https://github.com/rajveersinghal/ANALYTIX.AI.git
