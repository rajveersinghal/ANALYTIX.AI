"""
Authentication API endpoints for MongoDB
Async endpoints for signup, signin, logout with MongoDB
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from backend.dependencies import create_access_token, create_refresh_token, get_current_active_user
from backend.services.auth_service import create_user, authenticate_user
from backend.models.user import UserSignup, UserSignin, TokenResponse, UserResponse
from backend.config import settings
from backend.db.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup):
    """
    Register new user
    - Creates user account
    - Starts 14-day trial
    - Returns access token
    """
    try:
        user = await create_user(
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name
        )
        
        # Create tokens
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "plan": user.plan
            }
        }
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/signin", response_model=TokenResponse)
async def signin_form(form_data: OAuth2PasswordRequestForm = Depends()):
    """Sign in with form data (OAuth2 compatible)"""
    user = await authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "plan": user.plan
        }
    }


@router.post("/signin/json", response_model=TokenResponse)
async def signin_json(credentials: UserSignin):
    """Sign in with JSON data"""
    user = await authenticate_user(credentials.email, credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "plan": user.plan
        }
    }


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token (placeholder)"""
    # TODO: Implement refresh token logic
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Refresh token not implemented yet"
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """Logout user (placeholder)"""
    # TODO: Implement token blacklisting
    return {"message": "Logged out successfully"}
