import os
import tempfile
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.seed import _seed_catalog, _seed_demo_business


@pytest.fixture(scope="session")
def test_engine():
    """Create a static-pool in-memory SQLite engine for the test session."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    return engine


@pytest.fixture
def db_session(test_engine):
    """Provide a transactional database session for each test, seeded with demo data."""
    # Recreate tables cleanly before each test
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    Session = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = Session()

    # Seed the catalog and demo business
    _seed_catalog(session)
    _seed_demo_business(session)

    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    """Provide a FastAPI TestClient bound to the isolated test database session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def sample_business_data():
    return {
        "name": "Zenith Solar Tech Pvt Ltd",
        "business_type": "Private Limited Company",
        "sector": "Renewable Energy",
        "state": "Maharashtra",
        "district": "Pune",
        "investment": 12000000.0,
        "employees": 45,
        "stage": "Starting Business",
    }


@pytest.fixture
def sample_food_business_data():
    return {
        "name": "TasteCraft Foods Pvt Ltd",
        "business_type": "Private Limited Company",
        "sector": "Food Manufacturing",
        "state": "Tamil Nadu",
        "district": "Coimbatore",
        "investment": 6000000.0,
        "employees": 30,
        "stage": "Starting Business",
    }
