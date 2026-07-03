import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger(__name__)

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./coach.db").strip()
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Robustly URL-encode the password component to handle special characters (e.g. '@')
if SQLALCHEMY_DATABASE_URL.startswith("postgresql://"):
    try:
        from urllib.parse import quote_plus
        prefix, rest = SQLALCHEMY_DATABASE_URL.split("://", 1)
        if "@" in rest:
            user_pass, host_db = rest.rsplit("@", 1)
            if ":" in user_pass:
                user, password = user_pass.split(":", 1)
                encoded_password = quote_plus(password)
                SQLALCHEMY_DATABASE_URL = f"{prefix}://{user}:{encoded_password}@{host_db}"
    except Exception as e:
        logger.warning("Failed to auto-encode database URL password: %s", e)

# connect_args={"check_same_thread": False} is required only for SQLite
connect_args = {}
engine_kwargs = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # Managed Postgres (e.g. Supabase) silently drops idle connections. Ping
    # before use and recycle before the server's timeout so pooled connections
    # never surface as stale-connection 500s.
    engine_kwargs = {"pool_pre_ping": True, "pool_recycle": 1800}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args, **engine_kwargs
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get db session in FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
