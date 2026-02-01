@echo off
REM Setup script for ANALYTIX.AI (Windows)

echo Setting up ANALYTIX.AI...

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
pip install -r requirements-dev.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo .env file created. Please update with your settings.
)

REM Create necessary directories
echo Creating data directories...
if not exist data\raw mkdir data\raw
if not exist data\processed mkdir data\processed
if not exist data\models mkdir data\models
if not exist logs mkdir logs

echo Setup complete! Run 'streamlit run src\app.py' to start the application.
pause
