# ANALYTIX.AI FastAPI Backend

## Overview

Production-ready FastAPI backend for ANALYTIX.AI Decision Intelligence System. Provides REST API for authentication, data processing, ML model training, predictions, and intelligence features.

## Features

- **Authentication**: JWT-based auth with trial activation
- **User Management**: Profile, onboarding, trial status
- **Dataset Management**: Upload, process, validate datasets
- **ML Operations**: Train models, make predictions, track experiments
- **Intelligence**: Intent detection, recommendations, insights, SHAP explanations
- **API Documentation**: Auto-generated Swagger UI and ReDoc

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements-backend.txt
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit .env with your configuration
```

### 3. Run the Server

```bash
# Development mode (with auto-reload)
uvicorn backend.main:app --reload --port 8000

# Production mode
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 4. Access API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/api/openapi.json

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /signup` - Register new user
- `POST /signin` - Login (form data)
- `POST /signin/json` - Login (JSON body)
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user

### Users (`/api/v1/users`)
- `GET /me` - Get current user profile
- `PUT /me` - Update user profile
- `GET /me/onboarding` - Get onboarding data
- `POST /me/onboarding` - Save onboarding data
- `GET /me/trial` - Get trial status
- `POST /me/upgrade` - Upgrade to Pro (placeholder)

### Datasets (`/api/v1/datasets`) - Coming Soon
- Upload and manage datasets
- Quality checks and validation
- Data preview and statistics

### Models (`/api/v1/models`) - Coming Soon
- Train ML models
- View model metrics
- Download trained models

### Predictions (`/api/v1/predictions`) - Coming Soon
- Single and batch predictions
- What-if analysis
- Prediction history

### Intelligence (`/api/v1/intelligence`) - Coming Soon
- Intent detection
- Recommendations
- Insights generation
- SHAP explanations

## Project Structure

```
backend/
├── __init__.py
├── main.py                 # FastAPI application
├── config.py              # Configuration management
├── database.py            # Database connection
├── dependencies.py        # Shared dependencies
├── .env.example           # Environment variables template
│
├── api/                   # API routes
│   ├── __init__.py
│   ├── auth.py           # Authentication endpoints
│   ├── users.py          # User management
│   ├── datasets.py       # Dataset operations (TODO)
│   ├── models.py         # ML model operations (TODO)
│   ├── predictions.py    # Prediction endpoints (TODO)
│   └── intelligence.py   # Intelligence features (TODO)
│
├── models/               # Pydantic models
│   ├── __init__.py
│   ├── user.py          # User schemas
│   ├── dataset.py       # Dataset schemas
│   ├── model.py         # Model schemas
│   └── prediction.py    # Prediction schemas
│
├── services/            # Business logic
│   ├── __init__.py
│   ├── auth_service.py  # Authentication logic
│   ├── data_service.py  # Data processing (TODO)
│   ├── ml_service.py    # ML operations (TODO)
│   └── intelligence_service.py  # Intelligence features (TODO)
│
└── db/                  # Database models
    ├── __init__.py
    └── models.py        # SQLAlchemy ORM models
```

## Database

### SQLite (Development)
Default configuration uses SQLite for easy setup:
```
DATABASE_URL=sqlite:///./analytix.db
```

### PostgreSQL (Production)
For production, use PostgreSQL:
```
DATABASE_URL=postgresql://user:password@localhost/analytix
```

### Migrations
Database tables are auto-created on first run. For production, use Alembic for migrations:
```bash
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Testing

```bash
# Run tests
pytest backend/tests/ -v

# With coverage
pytest backend/tests/ --cov=backend --cov-report=html
```

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- CORS configured for frontend origins
- Input validation with Pydantic
- SQL injection protection with SQLAlchemy ORM

**Production Checklist**:
- [ ] Change `SECRET_KEY` in .env
- [ ] Set `DEBUG=False`
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Use environment-specific CORS origins

## Integration with Frontend

The HTML frontend connects to this API:

1. User signs up/signs in → Receives JWT token
2. Token stored in localStorage
3. All API requests include `Authorization: Bearer <token>` header
4. Frontend calls endpoints for data upload, model training, predictions

## Integration with Streamlit

Streamlit app can optionally use this API:

1. Add "Use FastAPI Backend" checkbox in Streamlit sidebar
2. If enabled, make API calls instead of direct module imports
3. Share authentication token between Streamlit and FastAPI

## License

MIT License - See LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
