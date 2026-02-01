@echo off
echo Starting ANALYTIX.AI...
echo.
call venv\Scripts\activate.bat
streamlit run src\app.py
pause
