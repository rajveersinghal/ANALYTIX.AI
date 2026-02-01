"""
User management API endpoints for MongoDB
Async endpoints for user profile, onboarding, trial status
"""

from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime

from backend.dependencies import get_current_active_user
from backend.db.models import User
from backend.models.user import UserResponse, UserUpdate, OnboardingRequest, OnboardingResponse, TrialStatus
from backend.services.auth_service import save_onboarding_data, get_onboarding_data
from backend.config import settings

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get current user profile"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "plan": current_user.plan,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }


@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update user profile"""
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    
    current_user.updated_at = datetime.utcnow()
    await current_user.save()
    
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "plan": current_user.plan,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }


@router.post("/me/onboarding", response_model=OnboardingResponse)
async def save_user_onboarding(
    onboarding: OnboardingRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Save user onboarding data"""
    onboarding_data = await save_onboarding_data(
        user_id=str(current_user.id),
        goal=onboarding.goal,
        experience_level=onboarding.experience_level,
        dataset_choice=onboarding.dataset_choice
    )
    
    return {
        "id": str(onboarding_data.id),
        "user_id": onboarding_data.user_id,
        "goal": onboarding_data.goal,
        "experience_level": onboarding_data.experience_level,
        "dataset_choice": onboarding_data.dataset_choice,
        "created_at": onboarding_data.created_at
    }


@router.get("/me/onboarding", response_model=OnboardingResponse)
async def get_user_onboarding(current_user: User = Depends(get_current_active_user)):
    """Get user onboarding data"""
    onboarding_data = await get_onboarding_data(str(current_user.id))
    
    if not onboarding_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Onboarding data not found"
        )
    
    return {
        "id": str(onboarding_data.id),
        "user_id": onboarding_data.user_id,
        "goal": onboarding_data.goal,
        "experience_level": onboarding_data.experience_level,
        "dataset_choice": onboarding_data.dataset_choice,
        "created_at": onboarding_data.created_at
    }


@router.get("/me/trial", response_model=TrialStatus)
async def get_trial_status(current_user: User = Depends(get_current_active_user)):
    """Get user trial status"""
    is_trial = current_user.plan == "free"
    is_expired = False
    days_remaining = 0
    
    if is_trial and current_user.trial_end:
        now = datetime.utcnow()
        is_expired = current_user.trial_end < now
        
        if not is_expired:
            days_remaining = (current_user.trial_end - now).days
    
    return {
        "is_trial": is_trial,
        "is_expired": is_expired,
        "days_remaining": days_remaining,
        "trial_end": current_user.trial_end
    }


@router.post("/me/upgrade")
async def upgrade_to_pro(current_user: User = Depends(get_current_active_user)):
    """Upgrade to Pro plan (placeholder)"""
    # TODO: Implement payment integration
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Payment integration not implemented yet"
    )
