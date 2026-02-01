#!/bin/bash
# Setup script for ANALYTIX.AI

echo "Setting up ANALYTIX.AI..."

# Create virtual environment
echo "Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate || . venv/Scripts/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo ".env file created. Please update with your settings."
fi

# Create necessary directories
echo "Creating data directories..."
mkdir -p data/raw data/processed data/models logs

echo "Setup complete! Run 'streamlit run src/app.py' to start the application."
