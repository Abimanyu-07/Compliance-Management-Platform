from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Business, User
from app.schemas import UserLogin, UserRegister
from app.services.requirement_engine import get_applicable_requirements
from app.services.workflow import ensure_applications_for_business, serialize_business
from app.utils.responses import fail, ok
from app.utils.security import create_access_token, decode_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
    }


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        fail("UNAUTHORIZED", "Missing or invalid authorization header.", 401)
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        fail("INVALID_TOKEN", "Token is invalid or has expired.", 401)
    user_id = int(payload["sub"])
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        fail("USER_NOT_FOUND", "User account not found or disabled.", 401)
    return user


@router.post("/register", summary="Register new user account")
def register(payload: UserRegister, db: Session = Depends(get_db)):
    email_clean = payload.email.lower().strip()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        fail("EMAIL_ALREADY_EXISTS", "A user account with this email already exists.", 400)

    hashed = hash_password(payload.password)
    user = User(
        email=email_clean,
        full_name=payload.full_name.strip(),
        hashed_password=hashed,
        role=payload.role or "OWNER",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Automatically create initial business if provided or create a starter profile
    company_name = payload.company_name or f"{user.full_name}'s Enterprise"
    business = Business(
        user_id=user.id,
        name=company_name,
        business_type="Private Limited Company",
        sector=payload.sector or "Food Manufacturing",
        state=payload.state or "Tamil Nadu",
        district=payload.district or "Coimbatore",
        investment=payload.investment if payload.investment is not None else 5000000.0,
        employees=payload.employees if payload.employees is not None else 25,
        stage=payload.stage or "Starting Business",
    )
    db.add(business)
    db.commit()
    db.refresh(business)

    # Run requirement engine & initialize applications for user's business
    identified = get_applicable_requirements(business, db)["total"]
    ensure_applications_for_business(db, business)

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})

    return ok(
        {
            "access_token": token,
            "token_type": "bearer",
            "user": _serialize_user(user),
            "business": serialize_business(business),
            "requirements_identified": identified,
        },
        "Account created successfully",
        201,
    )


@router.post("/login", summary="Login with email and password")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    email_clean = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        fail("INVALID_CREDENTIALS", "Invalid email or password.", 401)

    if not user.is_active:
        fail("ACCOUNT_DISABLED", "This account has been disabled.", 403)

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})

    user_businesses = (
        db.query(Business).filter(Business.user_id == user.id).order_by(Business.id).all()
    )
    # If no business specifically assigned yet, return seeded / all businesses
    if not user_businesses:
        user_businesses = db.query(Business).order_by(Business.id).all()

    return ok(
        {
            "access_token": token,
            "token_type": "bearer",
            "user": _serialize_user(user),
            "businesses": [serialize_business(b) for b in user_businesses],
        },
        "Login successful",
    )


@router.get("/me", summary="Get current logged in user profile")
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_businesses = (
        db.query(Business).filter(Business.user_id == user.id).order_by(Business.id).all()
    )
    if not user_businesses:
        user_businesses = db.query(Business).order_by(Business.id).all()

    return ok(
        {
            "user": _serialize_user(user),
            "businesses": [serialize_business(b) for b in user_businesses],
        }
    )


@router.post("/logout", summary="Logout user session")
def logout():
    return ok({}, "Logged out successfully")
