from app.exceptions import ConflictError, UnauthorizedError
from app.models.user import User
from passlib.context import CryptContext
from sqlalchemy.orm import Session

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)


def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user


def authenticate_user_or_raise(db: Session, username: str, password: str):
    user = authenticate_user(db, username, password)
    if not user:
        raise UnauthorizedError("Invalid credentials")
    return user


def list_users_public(db: Session):
    """Return id + username for all users (authenticated caller)."""
    users = db.query(User).order_by(User.username.asc()).all()
    return users


def create_user(db: Session, data):

    if db.query(User).filter(User.username == data.username).first():
        raise ConflictError("Username already registered")

    if db.query(User).filter(User.email == data.email).first():
        raise ConflictError("Email already registered")

    hashed_password = hash_password(data.password)

    user = User(
        username=data.username,
        email=data.email,
        password_hash=hashed_password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user
