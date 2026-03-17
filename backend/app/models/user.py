from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.sql import func
from app.database.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(100), unique=True, nullable=False)

    email = Column(String(255), nullable=False)

    password_hash = Column(Text, nullable=False)

    telegram_chat_id = Column(String(50))

    created_at = Column(TIMESTAMP, server_default=func.now())