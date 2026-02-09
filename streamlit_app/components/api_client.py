import requests
import streamlit as st

BASE_URL = "http://localhost:8001"

def get(endpoint):
    try:
        response = requests.get(f"{BASE_URL}{endpoint}")
        if response.status_code == 200:
            return response.json()
        return None
    except:
        return None

def post(endpoint, json=None, data=None, files=None):
    try:
        response = requests.post(f"{BASE_URL}{endpoint}", json=json, data=data, files=files)
        return response
    except:
        return None
