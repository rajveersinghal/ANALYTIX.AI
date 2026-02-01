"""
Authentication Dependencies
JWT token validation and user authentication for MongoDB
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from beanie import PydanticObjectId

from backend.config import settings
from backend.db.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/signin")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise credentials_exception
    
    except JWTError:
        raise credentials_exception
    
    # Get user from MongoDB
    user = await User.get(PydanticObjectId(user_id))
    
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def verify_trial_access(current_user: User = Depends(get_current_active_user)) -> User:
    """Verify user has trial or paid access"""
    # Pro users always have access
    if current_user.plan == "pro" or current_user.plan == "enterprise":
        return current_user
    
    # Check trial status
    if current_user.trial_end and current_user.trial_end > datetime.utcnow():
        return current_user
    
    # Trial expired
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Trial expired. Please upgrade to continue using ANALYTIX.AI"
    )
