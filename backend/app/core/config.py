from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings
from typing import List, Union, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "StayFocus FastAPI Backend"
    API_V1_STR: str = "/api/v1"

    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database settings
    POSTGRES_SERVER: Optional[str] = "localhost"
    POSTGRES_USER: Optional[str] = "stayfocususer"
    POSTGRES_PASSWORD: Optional[str] = "stayfocuspassword"
    POSTGRES_DB: Optional[str] = "stayfocusdb"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        # This property will construct the database URI.
        # It relies on POSTGRES_USER, POSTGRES_PASSWORD, etc. being loaded from .env
        # or environment variables when the Settings instance is created.
        if self.POSTGRES_USER and self.POSTGRES_PASSWORD and self.POSTGRES_SERVER and self.POSTGRES_DB:
            return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"
        else:
            # Fallback or error if essential DB connection details are missing
            # For local development, a SQLite fallback can be useful.
            # Ensure a clear warning is logged if this fallback is used.
            print("WARNING: PostgreSQL connection details (USER, PASSWORD, SERVER, DB) not fully set in environment.")
            print("Falling back to SQLite database: ./test_fallback.db")
            return "sqlite:///./test_fallback.db"

    FASTAPI_USERS_SECRET: str = "75c7135688ed48580b7275db75c1fa949fd5123fed330d85da5aa039fd67af19" # Default if not in .env, .env should override
    PPLX_API_KEY: Optional[str] = None # For Perplexity AI
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore" # For Pydantic V2, to ignore extra fields from .env if any

settings = Settings()
