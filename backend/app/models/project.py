from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey, Integer, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.db.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    unit_system = Column(String(20), default="imperial")  # "imperial" or "metric"
    settings = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    sheets = relationship("Sheet", back_populates="project", cascade="all, delete-orphan")
    pieces = relationship("Piece", back_populates="project", cascade="all, delete-orphan")
    cutting_plans = relationship("CuttingPlan", back_populates="project", cascade="all, delete-orphan")


class Sheet(Base):
    __tablename__ = "sheets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    width = Column(Numeric(10, 2), nullable=False)
    height = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    material_type = Column(String(100))
    thickness = Column(Numeric(10, 3))
    has_grain = Column(Boolean, default=False)
    cost_per_sheet = Column(Numeric(10, 2))

    # Relationships
    project = relationship("Project", back_populates="sheets")


class Piece(Base):
    __tablename__ = "pieces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    label = Column(String(255))
    width = Column(Numeric(10, 2), nullable=False)
    height = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    grain_direction = Column(String(20))
    priority = Column(Integer, default=0)

    # Relationships
    project = relationship("Project", back_populates="pieces")


class CuttingPlan(Base):
    __tablename__ = "cutting_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    optimization_mode = Column(String(50))
    plan_data = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", back_populates="cutting_plans")
