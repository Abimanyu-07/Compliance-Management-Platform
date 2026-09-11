from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="OWNER")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    businesses = relationship("Business", back_populates="owner")


class Business(Base):
    __tablename__ = "business"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    business_type = Column(String(120), nullable=False, default="Private Limited Company")
    sector = Column(String(120), nullable=False)
    state = Column(String(120), nullable=False)
    district = Column(String(120), nullable=False)
    investment = Column(Float, nullable=False, default=0)
    employees = Column(Integer, nullable=False, default=0)
    stage = Column(String(120), nullable=False, default="Starting Business")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="businesses")
    applications = relationship("Application", back_populates="business")
    documents = relationship("Document", back_populates="business")
    grievances = relationship("Grievance", back_populates="business")


class Requirement(Base):
    __tablename__ = "requirement"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(120), nullable=False)
    authority = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    sector = Column(String(120), nullable=True)
    state = Column(String(120), nullable=True)
    business_stage = Column(String(120), nullable=True)
    priority = Column(String(40), nullable=False, default="MEDIUM")
    application_method = Column(String(80), nullable=False, default="Online")
    official_portal = Column(String(500), nullable=True)
    estimated_processing_days = Column(Integer, nullable=True)
    rule_tags = Column(String(255), nullable=True)

    documents = relationship("RequirementDocument", back_populates="requirement")
    applications = relationship("Application", back_populates="requirement")


class RequirementDocument(Base):
    __tablename__ = "requirement_document"

    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("requirement.id"), nullable=False)
    document_type = Column(String(120), nullable=False)
    document_name = Column(String(255), nullable=False)
    mandatory = Column(Boolean, default=True)

    requirement = relationship("Requirement", back_populates="documents")


class Application(Base):
    __tablename__ = "application"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business.id"), nullable=False, index=True)
    requirement_id = Column(Integer, ForeignKey("requirement.id"), nullable=False, index=True)
    application_number = Column(String(80), unique=True, index=True)
    status = Column(String(40), nullable=False, default="NOT_STARTED")
    submitted_date = Column(DateTime, nullable=True)
    deadline = Column(DateTime, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    risk_level = Column(String(40), nullable=True)
    readiness_score = Column(Integer, nullable=False, default=0)
    blocking_reason = Column(Text, nullable=True)

    business = relationship("Business", back_populates="applications")
    requirement = relationship("Requirement", back_populates="applications")
    documents = relationship("Document", back_populates="application")
    grievances = relationship("Grievance", back_populates="application")


class Document(Base):
    __tablename__ = "document"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business.id"), nullable=False)
    application_id = Column(Integer, ForeignKey("application.id"), nullable=True)
    document_name = Column(String(255), nullable=False)
    document_type = Column(String(120), nullable=False)
    file_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=True)
    status = Column(String(40), nullable=False, default="UPLOADED")
    validation_score = Column(Integer, nullable=True)
    extracted_text = Column(Text, nullable=True)
    validation_result = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="documents")
    application = relationship("Application", back_populates="documents")


class Dependency(Base):
    __tablename__ = "dependency"

    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("requirement.id"), nullable=False)
    depends_on_requirement_id = Column(Integer, ForeignKey("requirement.id"), nullable=False)
    description = Column(Text, nullable=True)


class Grievance(Base):
    __tablename__ = "grievance"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business.id"), nullable=False)
    application_id = Column(Integer, ForeignKey("application.id"), nullable=True)
    category = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(40), nullable=False, default="MEDIUM")
    status = Column(String(40), nullable=False, default="OPEN")
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="grievances")
    application = relationship("Application", back_populates="grievances")


class Scheme(Base):
    __tablename__ = "scheme"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    sector = Column(String(120), nullable=True)
    state = Column(String(120), nullable=True)
    business_size = Column(String(80), nullable=True)
    benefits = Column(Text, nullable=True)
    eligibility = Column(Text, nullable=True)
    min_investment = Column(Float, nullable=True)
    max_investment = Column(Float, nullable=True)
    stage = Column(String(120), nullable=True)
