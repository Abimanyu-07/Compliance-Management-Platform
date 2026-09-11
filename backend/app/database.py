import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DEFAULT_SQLITE = f"sqlite:///{(BASE_DIR / 'innovx.db').as_posix()}"


def _build_engine():
    url = (os.getenv("DATABASE_URL") or "").strip()
    if not url:
        url = DEFAULT_SQLITE

    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    try:
        engine = create_engine(url, connect_args=connect_args, future=True)
        with engine.connect():
            pass
        return engine, url
    except Exception:
        engine = create_engine(DEFAULT_SQLITE, connect_args={"check_same_thread": False}, future=True)
        return engine, DEFAULT_SQLITE


engine, DATABASE_URL = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
