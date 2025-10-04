import uuid
from typing import Optional, AsyncGenerator # AsyncGenerator for async yield

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, UUIDIDMixin
from fastapi_users.db import SQLAlchemyUserDatabase
# from fastapi_users.password import PasswordHelper

from app.db.session import SessionLocal
from app.models.user import User
from app.core.config import settings

# UserDatabase adapter
# For fastapi-users v11+, an async session is generally expected for the DB adapter.
# If SessionLocal is synchronous, this would need adjustment for a fully async setup
# (e.g. by creating an async engine and AsyncSession).
# However, SQLAlchemyUserDatabase itself is not async. The key is how the session is *used*.
# The provided approach of yielding a sync session from an async def generator is a common pattern.
async def get_user_db() -> AsyncGenerator[SQLAlchemyUserDatabase, None]:
    db_session = SessionLocal() # This creates a standard synchronous session
    try:
        yield SQLAlchemyUserDatabase(db_session, User)
    finally:
        db_session.close()

# UserManager
class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.FASTAPI_USERS_SECRET
    verification_token_secret = settings.FASTAPI_USERS_SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"Verification requested for user {user.id}. Verification token: {token}")

async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


# Authentication Backend (JWT)
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy

bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=str(settings.FASTAPI_USERS_SECRET), lifetime_seconds=3600)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# FastAPIUsers Main Instance
from fastapi_users import FastAPIUsers

fastapi_users_instance = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend],
)
