from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import llm as llm_api_router
from app.api.endpoints import concursos as concursos_router
import uuid # For UUID type hint if needed

# Import fastapi-users components and schemas
from app.users import auth_backend, fastapi_users_instance # fastapi_users_instance was the new name
from app.schemas.user import UserRead, UserCreate, UserUpdate # Ensure UserUpdate is imported

app = FastAPI(title=settings.PROJECT_NAME)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/")
async def root():
    return {"message": "Hello World from FastAPI backend with auth!"}

# FastAPI-Users routers
# Auth router (login, logout)
app.include_router(
    fastapi_users_instance.get_auth_router(auth_backend),
    prefix="/auth/jwt", # Matches BearerTransport tokenUrl
    tags=["auth"],
)

# Register router
app.include_router(
    fastapi_users_instance.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

# Reset password router
app.include_router(
    fastapi_users_instance.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)

# Verify email router
app.include_router(
    fastapi_users_instance.get_verify_router(UserRead), # Requires UserRead schema
    prefix="/auth",
    tags=["auth"],
)

# Users router for /me and /{id} etc.
app.include_router(
    fastapi_users_instance.get_users_router(UserRead, UserUpdate), # Requires UserRead and UserUpdate
    prefix="/users",
    tags=["users"],
)


# LLM Router
app.include_router(llm_api_router.router, prefix=f"{settings.API_V1_STR}/llm", tags=["llm"])


# Concursos Router
app.include_router(concursos_router.router, prefix=f"{settings.API_V1_STR}/concursos", tags=["Concursos"])

# Placeholder for other application routers (e.g., for Concursos, Receitas)
# from app.api import concurso_router, receita_router # Example
# app.include_router(concurso_router, prefix="/api/v1/concursos", tags=["concursos"])
# app.include_router(receita_router, prefix="/api/v1/receitas", tags=["receitas"])
