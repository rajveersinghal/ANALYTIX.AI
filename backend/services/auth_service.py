"""
Authentication service for MongoDB
User authentication, registration, and onboarding with MongoDB
"""

from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from beanie import PydanticObjectId

from backend.db.models import User, OnboardingData, PlanType
from backend.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)


async def create_user(email: str, password: str, full_name: str) -> User:
    """Create new user with trial"""
    # Check if user exists
    existing_user = await User.find_one(User.email == email)
    if existing_user:
        raise ValueError("Email already registered")
    
    # Create user
    trial_start = datetime.utcnow()
    trial_end = trial_start + timedelta(days=settings.TRIAL_DURATION_DAYS)
    
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=full_name,
        is_active=True,
        plan=PlanType.FREE,
        trial_start=trial_start,
        trial_end=trial_end
    )
    
    await user.insert()
    return user


async def authenticate_user(email: str, password: str) -> Optional[User]:
    """Authenticate user"""
    user = await User.find_one(User.email == email)
    
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    return user


async def save_onboarding_data(
    user_id: str,
    goal: str,
    experience_level: str,
    dataset_choice: str
) -> OnboardingData:
    """Save user onboarding data"""
    # Check if onboarding data already exists
    existing = await OnboardingData.find_one(OnboardingData.user_id == user_id)
    
    if existing:
        # Update existing
        existing.goal = goal
        existing.experience_level = experience_level
        existing.dataset_choice = dataset_choice
        await existing.save()
        return existing
    
    # Create new
    onboarding = OnboardingData(
        user_id=user_id,
        goal=goal,
        experience_level=experience_level,
        dataset_choice=dataset_choice
    )
    
    await onboarding.insert()
    return onboarding


async def get_onboarding_data(user_id: str) -> Optional[OnboardingData]:
    """Get user onboarding data"""
    return await OnboardingData.find_one(OnboardingData.user_id == user_id)
