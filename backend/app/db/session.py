from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# The settings object is instantiated in app.core.config
# SQLALCHEMY_DATABASE_URI will be resolved when settings.SQLALCHEMY_DATABASE_URI is accessed.
engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI), pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
