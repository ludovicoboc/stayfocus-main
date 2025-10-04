from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Custom imports for StayFocus project
import os
import sys
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, PROJECT_ROOT)
from app.core.config import settings
from app.db.base_class import Base

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata  # Modified for StayFocus

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

# Set sqlalchemy.url from application settings
db_uri = str(settings.SQLALCHEMY_DATABASE_URI)
if not db_uri or db_uri == 'None' or 'test_fallback.db' in db_uri: # Check if it's None, empty or the fallback
    print(f"WARNING in alembic/env.py: settings.SQLALCHEMY_DATABASE_URI is not PostgreSQL or is using fallback (current value: '{db_uri}').")
    print("Alembic will use 'sqlite:///./alembic_default.db' for migrations if no real DB is configured.")
    # Provide a default sqlite DB for alembic if no proper DB is configured yet.
    # This allows generating initial migrations without a running Postgres instance.
    db_uri = "sqlite:///./alembic_default.db"
config.set_main_option('sqlalchemy.url', db_uri)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Use the application's engine for online migrations
    from app.db.session import engine as app_engine
    connectable = app_engine

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
