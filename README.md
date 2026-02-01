# 🧠 ANALYTIX.AI - Intelligent Decision Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Transform your data into intelligent decisions with our no-code AI platform. Upload data, train models, and get predictions in minutes—not months.

---

## ✨ Features

### 🚀 **Automated Machine Learning**
- One-click model training with automatic algorithm selection
- Hyperparameter tuning and optimization
- Support for classification, regression, and clustering

### 🧹 **Smart Data Cleaning**
- AI-powered data quality assessment
- Automatic handling of missing values and outliers
- Intelligent data type detection and conversion

### ⚡ **Real-Time Predictions**
- High-performance inference engine
- REST API for seamless integration
- Batch and single prediction support

### 🎯 **Explainable AI**
- SHAP-based model explanations
- Feature importance visualization
- Confidence scores for all predictions

### 📊 **Advanced Analytics**
- Comprehensive exploratory data analysis
- Interactive visualizations
- Statistical insights and correlations

### 🔐 **Enterprise Security**
- JWT-based authentication
- Role-based access control
- Data encryption at rest and in transit

---

## 🎨 Frontend Features

### 💫 **Beautiful UI/UX**
- Modern, responsive design with smooth animations
- Password visibility toggle on auth forms
- Ripple effects and scroll-triggered animations
- Parallax hero section and interactive cards

### 🎯 **Onboarding Wizard**
- 3-step personalized setup
- Goal selection, experience level, and dataset choice
- Backend integration with progress tracking
- Skip option for quick access

### 📱 **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimized
- Smooth scrolling and proper layout

### 🎭 **Testing Mode**
- Authentication disabled for easy testing
- Direct access to all pages
- No signup required for exploration

---

## 📁 Project Structure

```
ANALYTIX.AI/
├── backend/                    # FastAPI backend
│   ├── api/                   # API endpoints
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── datasets.py       # Dataset management
│   │   ├── models.py         # Model training & management
│   │   └── predictions.py    # Prediction endpoints
│   ├── services/              # Business logic
│   │   ├── auth_service.py
│   │   ├── dataset_service.py
│   │   ├── model_service.py
│   │   └── prediction_service.py
│   ├── models/                # Pydantic models
│   ├── db/                    # Database configuration
│   ├── core/                  # Core utilities
│   └── main.py               # FastAPI application
│
├── frontend/                  # Frontend application
│   ├── index.html            # Landing page
│   ├── signup.html           # User registration
│   ├── signin.html           # User login
│   ├── onboarding.html       # 3-step wizard
│   ├── dashboard.html        # Main dashboard
│   ├── css/                  # Stylesheets
│   │   ├── main.css         # Global styles
│   │   ├── auth.css         # Authentication pages
│   │   ├── onboarding.css   # Onboarding wizard
│   │   └── dashboard.css    # Dashboard styles
│   └── js/                   # JavaScript
│       ├── core/            # Core utilities
│       │   └── api-client.js
│       └── pages/           # Page-specific scripts
│           ├── landing.js
│           ├── auth-pages.js
│           ├── onboarding.js
│           └── dashboard.js
│
├── data/                      # Data processing modules
│   ├── cleaner.py            # Data cleaning
│   ├── profiler.py           # Data profiling
│   └── validator.py          # Data validation
│
├── ml/                        # Machine learning modules
│   ├── trainer.py            # Model training
│   ├── predictor.py          # Predictions
│   └── explainer.py          # Model explanations
│
├── intelligence/              # AI intelligence layer
│   ├── intent_detector.py    # User intent detection
│   ├── orchestrator.py       # Workflow orchestration
│   └── recommender.py        # Smart recommendations
│
└── streamlit_app/            # Streamlit interface
    └── app.py                # Streamlit dashboard
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- MongoDB 7.0+
- Node.js (for frontend development)

### 1. Clone Repository

```bash
git clone https://github.com/rajveersinghal/ANALYTIX.AI.git
cd ANALYTIX.AI
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string

# Start backend server
cd backend
uvicorn main:app --reload --port 8000
```

Backend will be available at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Start development server
python -m http.server 8080
```

Frontend will be available at: `http://localhost:8080`

### 4. MongoDB Setup

```bash
# Start MongoDB (if running locally)
mongod --dbpath /path/to/data

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URL in .env file
```

---

## 🎯 Usage

### Testing Mode (No Authentication Required)

1. **Landing Page**: `http://localhost:8080`
   - Click any "Get Started" button

2. **Onboarding**: `http://localhost:8080/onboarding.html`
   - Select your goal (Predict, Understand, Automate, Explore)
   - Choose experience level (Beginner, Intermediate, Advanced)
   - Pick dataset option (Sample, Upload, Later)

3. **Dashboard**: `http://localhost:8080/dashboard.html`
   - Upload datasets
   - Train models
   - Make predictions

### Production Mode (Authentication Enabled)

Uncomment authentication checks in:
- `frontend/js/pages/onboarding.js` (lines 6-12)
- `frontend/js/pages/dashboard.js` (lines 6-12)

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Datasets
- `GET /api/datasets` - List all datasets
- `POST /api/datasets/upload` - Upload new dataset
- `GET /api/datasets/{id}` - Get dataset details
- `DELETE /api/datasets/{id}` - Delete dataset

### Models
- `GET /api/models` - List all models
- `POST /api/models/train` - Train new model
- `GET /api/models/{id}` - Get model details
- `DELETE /api/models/{id}` - Delete model

### Predictions
- `POST /api/predictions/predict` - Make prediction
- `GET /api/predictions/history` - Get prediction history

### Onboarding
- `POST /api/onboarding` - Save onboarding preferences

---

## 🎨 Frontend Enhancements

### Recent Updates

✅ **Password Visibility Toggle**
- Eye icon on password fields
- Click to show/hide passwords
- Smooth animations

✅ **Layout & Scrolling Fixes**
- Proper viewport handling
- Smooth scrolling enabled
- Responsive mobile design

✅ **Enhanced Animations**
- Ripple effects on buttons
- Scroll-triggered card animations
- Parallax hero section
- Navbar blur on scroll

✅ **Onboarding Wizard**
- 3-step personalized setup
- Progress tracking
- Backend integration
- Toast notifications

✅ **Testing Mode**
- No authentication required
- Direct page access
- Easy exploration

---

## 🧪 Testing

### Run Backend Tests
```bash
pytest backend/tests/
```

### Run Frontend Tests
```bash
# Open in browser and check console
http://localhost:8080
```

### Test API Endpoints
```bash
# Using curl
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","full_name":"Test User"}'
```

---

## � Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: MongoDB with Beanie ODM
- **Authentication**: JWT tokens
- **ML Libraries**: scikit-learn, XGBoost, SHAP
- **Data Processing**: pandas, numpy

### Frontend
- **HTML5** with semantic markup
- **CSS3** with custom animations
- **Vanilla JavaScript** (ES6+)
- **Google Fonts** (Inter)

### Infrastructure
- **API Documentation**: Swagger/OpenAPI
- **CORS**: Enabled for development
- **Environment**: Python virtual environment

---

## � Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=analytix_ai

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080

# Server
HOST=0.0.0.0
PORT=8000
```

---

## 📝 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Edit code
- Test locally
- Update documentation

### 3. Commit Changes
```bash
git add .
git commit -m "feat: your feature description"
```

### 4. Push to GitHub
```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request
- Go to GitHub repository
- Create pull request
- Request review

---

## 🐛 Known Issues & Limitations

### Testing Mode
- Authentication is disabled for easy testing
- Some features may not work without backend connection
- Enable authentication for production deployment

### Browser Compatibility
- Tested on Chrome, Firefox, Edge
- IE11 not supported
- Mobile browsers fully supported

---

## � Deployment

### Backend Deployment
```bash
# Using Uvicorn
uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Using Gunicorn
gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend Deployment
- Deploy to any static hosting (Netlify, Vercel, GitHub Pages)
- Update API URLs in `api-client.js`
- Enable authentication checks

---

## 📚 Documentation

- **API Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **Walkthrough**: See `brain/walkthrough.md` for detailed guide

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Rajveer Singhal**
- GitHub: [@rajveersinghal](https://github.com/rajveersinghal)
- Repository: [ANALYTIX.AI](https://github.com/rajveersinghal/ANALYTIX.AI)

---

## 🙏 Acknowledgments

- FastAPI for the amazing web framework
- MongoDB for flexible data storage
- scikit-learn for ML capabilities
- SHAP for model explainability
- Inter font family by Google Fonts

---

## 📞 Support

For support, email rajveer@example.com or open an issue on GitHub.

---

<div align="center">

**Made with ❤️ by Rajveer Singhal**

⭐ Star this repo if you find it helpful!

</div>
