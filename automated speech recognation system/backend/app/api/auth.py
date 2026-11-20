from fastapi import APIRouter, HTTPException, status, Depends
from backend.app.schemas.models import UserRegister, UserLogin, TokenResponse, UserResponse
from backend.app.core.security import hash_password, verify_password, create_access_token, get_current_user_optional, get_current_user_required
from backend.app.database.repositories import UserRepository

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(payload: UserRegister):
    existing = UserRepository.get_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    pw_hash = hash_password(payload.password)
    user = UserRepository.create(name=payload.name, email=payload.email, password_hash=pw_hash)
    token = create_access_token(user["user_id"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    user = UserRepository.get_by_email(payload.email)
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    token = create_access_token(user["user_id"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user_optional)):
    return {
        "user_id": current_user.get("user_id"),
        "name": current_user.get("name"),
        "email": current_user.get("email"),
        "role": current_user.get("role", "researcher"),
        "is_guest": current_user.get("is_guest", False)
    }
