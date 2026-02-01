#!/bin/bash
# Test runner script

echo "Running ANALYTIX.AI tests..."

# Run all tests with coverage
pytest tests/ -v --cov=src --cov-report=html --cov-report=term

echo "Tests complete! Coverage report available in htmlcov/index.html"
