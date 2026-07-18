from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User, RoleEnum
from app.schemas.user import UserCreate, UserResponse
from app.core import security
from app.api.deps import get_current_active_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Register a new user. New users default to the 'guest' role.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Auto-Admin feature: First user to register becomes admin
    user_count = db.query(User).count()
    assigned_role = RoleEnum.admin if user_count == 0 else RoleEnum.guest
    
    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        role=assigned_role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login")
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=400, detail="Incorrect email or password"
        )
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    return {
        "access_token": security.create_access_token(user.id),
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get current user details.
    """
    return current_user
