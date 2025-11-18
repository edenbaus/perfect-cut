from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.project import Project, Sheet, Piece
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, Project as ProjectSchema,
    SheetCreate, PieceCreate
)

router = APIRouter()


@router.get("", response_model=List[ProjectSchema])
def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all projects for the current user."""
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    return projects


@router.post("", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new project."""
    # Create project
    db_project = Project(
        user_id=current_user.id,
        name=project_data.name,
        description=project_data.description,
        settings=project_data.settings
    )
    db.add(db_project)
    db.flush()  # Get the project ID

    # Add sheets
    for sheet_data in project_data.sheets:
        db_sheet = Sheet(
            project_id=db_project.id,
            **sheet_data.model_dump()
        )
        db.add(db_sheet)

    # Add pieces
    for piece_data in project_data.pieces:
        db_piece = Piece(
            project_id=db_project.id,
            **piece_data.model_dump()
        )
        db.add(db_piece)

    db.commit()
    db.refresh(db_project)

    return db_project


@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return project


@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Update fields
    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    db.delete(project)
    db.commit()

    return None


# Pieces endpoints
@router.post("/{project_id}/pieces", response_model=ProjectSchema)
def add_piece(
    project_id: UUID,
    piece_data: PieceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a piece to a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    db_piece = Piece(
        project_id=project_id,
        **piece_data.model_dump()
    )
    db.add(db_piece)
    db.commit()
    db.refresh(project)

    return project


@router.delete("/{project_id}/pieces/{piece_id}", response_model=ProjectSchema)
def delete_piece(
    project_id: UUID,
    piece_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a piece from a project."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    piece = db.query(Piece).filter(
        Piece.id == piece_id,
        Piece.project_id == project_id
    ).first()

    if not piece:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Piece not found"
        )

    db.delete(piece)
    db.commit()
    db.refresh(project)

    return project
