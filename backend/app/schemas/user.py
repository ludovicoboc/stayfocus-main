import uuid
from typing import Optional
from pydantic import EmailStr, Field # Keep existing imports
from fastapi_users import schemas

class UserRead(schemas.BaseUser[uuid.UUID]):
    # Custom fields to include when reading a user
    full_name: Optional[str] = Field(None, example="John Doe")
    created_at: Optional[DateTime] = None # Use DateTime for Pydantic, will be str if serialized by FastAPI default encoder
    updated_at: Optional[DateTime] = None # Use DateTime for Pydantic

    class Config:
        orm_mode = True # Pydantic V1
        # from_attributes = True # Pydantic V2

class UserCreate(schemas.BaseUserCreate):
    # Custom fields to include when creating a user
    full_name: Optional[str] = Field(None, example="John Doe")
    # email and password are required by BaseUserCreate

class UserUpdate(schemas.BaseUserUpdate):
    # Custom fields that can be updated
    full_name: Optional[str] = Field(None, example="John Doe")
    # email and password updates are handled by BaseUserUpdate if provided
