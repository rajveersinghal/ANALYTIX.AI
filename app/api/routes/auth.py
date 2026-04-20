# app/api/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.auth.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.core.db.mongodb import get_database
from app.logger import logger
from pydantic import BaseModel, EmailStr
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str = "Analytix Guest"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=dict)
async def register(user_in: UserCreate):
    logger.info(f"Auth: Registration request received for {user_in.email}")
    db = get_database()
    email_lower = user_in.email.lower()
    existing_user = await db.users.find_one({"email": email_lower})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_dict = user_in.dict()
    user_dict["email"] = email_lower
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["is_active"] = True
    user_dict["created_at"] = datetime.utcnow()
    user_dict["tier"] = "free"
    
    result = await db.users.insert_one(user_dict)
    return {"message": "User created successfully", "user_id": str(result.inserted_id)}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Auth: Login request received for {form_data.username}")
    db = get_database()
    email_lower = form_data.username.lower()
    user = await db.users.find_one({"email": email_lower})
    
    if not user:
        logger.warning(f"Login Failure: User '{email_lower}' not found in database.")
        raise HTTPException(status_code=401, detail="Account not found")
        
    is_valid = verify_password(form_data.password, user["hashed_password"])
    if not is_valid:
        logger.warning(f"Login Failure: Incorrect password for '{email_lower}'. hash_start={user['hashed_password'][:10]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    # Remove sensitive data
    current_user.pop("hashed_password", None)
    current_user.pop("_id", None)
    return current_user
