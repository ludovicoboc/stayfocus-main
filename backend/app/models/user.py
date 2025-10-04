import uuid
from sqlalchemy import Column, String, Boolean, DateTime, func # Keep existing imports
from sqlalchemy.dialects.postgresql import UUID # Keep existing imports
from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from app.db.base_class import Base

class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "users" # Ensure tablename is still users

    # id, email, hashed_password, is_active, is_superuser, is_verified
    # are provided by SQLAlchemyBaseUserTableUUID.
    # We can add custom fields here.

    full_name = Column(String, index=True, nullable=True)

    # Timestamps (optional, but good to have)
    # Note: fastapi-users models don't include these by default.
    # If we want them, we add them as custom fields.
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Ensure any relationships defined previously are maintained if needed.
    # For now, the User model in the plan didn't have explicit relationships originating from it,
    # but other models (Concurso, Receita, Prioridade) link to User.
    # These relationships in other models should still work as they reference users.id.
