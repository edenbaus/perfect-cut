from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
import uuid


# Sheet Schemas
class SheetBase(BaseModel):
    width: Decimal
    height: Decimal
    quantity: int
    material_type: Optional[str] = None
    thickness: Optional[Decimal] = None
    has_grain: bool = False
    cost_per_sheet: Optional[Decimal] = None


class SheetCreate(SheetBase):
    pass


class Sheet(SheetBase):
    id: uuid.UUID
    project_id: uuid.UUID

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: float
        }


# Piece Schemas
class PieceBase(BaseModel):
    label: Optional[str] = None
    width: Decimal
    height: Decimal
    quantity: int
    grain_direction: Optional[str] = None
    priority: int = 0


class PieceCreate(PieceBase):
    pass


class Piece(PieceBase):
    id: uuid.UUID
    project_id: uuid.UUID

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: float
        }


# Project Schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    unit_system: str = "imperial"  # "imperial" or "metric"
    settings: Optional[dict] = None


class ProjectCreate(ProjectBase):
    sheets: Optional[List[SheetCreate]] = []
    pieces: Optional[List[PieceCreate]] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    unit_system: Optional[str] = None
    settings: Optional[dict] = None


class Project(ProjectBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    sheets: List[Sheet] = []
    pieces: List[Piece] = []

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: float
        }


# Cutting Plan Schemas
class OptimizationSettings(BaseModel):
    optimization_mode: str = "waste"  # "waste", "cuts", "sheets", "grain", "balanced"
    kerf_width: Decimal = Decimal("0.125")
    min_usable_offcut: Decimal = Decimal("6.0")
    grain_importance: str = "medium"  # "high", "medium", "low"


class OptimizeRequest(BaseModel):
    sheets: List[SheetCreate]
    pieces: List[PieceCreate]
    settings: OptimizationSettings


class PlacedPiece(BaseModel):
    piece_id: Optional[uuid.UUID] = None
    label: Optional[str] = None
    x: Decimal
    y: Decimal
    width: Decimal
    height: Decimal
    rotated: bool = False


class Cut(BaseModel):
    sequence: int
    x1: Decimal
    y1: Decimal
    x2: Decimal
    y2: Decimal
    description: str


class SheetLayout(BaseModel):
    sheet_index: int
    pieces: List[PlacedPiece]
    cuts: List[Cut]
    waste_area: Decimal
    waste_percentage: Decimal


class Instruction(BaseModel):
    step: int
    description: str
    measurement: str
    pieces_produced: List[str]
    safety_note: Optional[str] = None


class Statistics(BaseModel):
    total_waste_area: Decimal
    total_waste_percentage: Decimal
    total_cuts: int
    sheets_used: int
    largest_offcut_width: Optional[Decimal] = None
    largest_offcut_height: Optional[Decimal] = None
    estimated_time_minutes: Optional[int] = None


class OptimizeResponse(BaseModel):
    layouts: List[SheetLayout]
    statistics: Statistics
    instructions: List[Instruction]


class CuttingPlanCreate(BaseModel):
    project_id: uuid.UUID
    optimization_mode: str
    plan_data: dict


class CuttingPlan(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    optimization_mode: str
    plan_data: dict
    created_at: datetime

    class Config:
        from_attributes = True
