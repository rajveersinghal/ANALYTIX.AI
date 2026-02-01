# Contributing to ANALYTIX.AI

Thank you for your interest in contributing to ANALYTIX.AI! This document provides guidelines and instructions for contributing.

## Development Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ANALYTIX.AI
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 4. Set Up Environment Variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Code Style

### Python Code Standards
- Follow PEP 8 style guide
- Use Black for code formatting (line length: 100)
- Use type hints where applicable
- Write docstrings for all functions and classes (Google style)

### Running Code Quality Tools
```bash
# Format code
black src/

# Lint code
pylint src/

# Type checking
mypy src/
```

## Testing

### Running Tests
```bash
# Run all tests
pytest

# Run unit tests only
pytest tests/unit/

# Run with coverage
pytest --cov=src --cov-report=html
```

### Writing Tests
- Write unit tests for all new functions
- Maintain test coverage above 80%
- Use fixtures from `tests/conftest.py`
- Follow naming convention: `test_<function_name>`

## Pull Request Process

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Run Tests and Linting**
   ```bash
   pytest
   black src/
   pylint src/
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```
   
   Use conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `test:` for tests
   - `refactor:` for refactoring

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Project Structure

```
src/
├── core/           # Core ML pipeline
├── intelligence/   # Advanced analytics
└── app.py         # Main application

tests/
├── unit/          # Unit tests
└── integration/   # Integration tests

config/            # Configuration files
docs/              # Documentation
```

## Questions?

Feel free to open an issue for any questions or concerns!
