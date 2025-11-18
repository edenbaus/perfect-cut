from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from decimal import Decimal
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.project import (
    OptimizeRequest, OptimizeResponse,
    SheetLayout, PlacedPiece, Cut, Instruction, Statistics
)
from app.services.optimizer import CuttingOptimizer

router = APIRouter()


@router.post("", response_model=OptimizeResponse)
def optimize_cutting_plan(
    request: OptimizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate an optimized cutting plan based on sheets and pieces.
    """
    try:
        # Convert Pydantic models to dicts for the optimizer
        sheets = [sheet.model_dump() for sheet in request.sheets]
        pieces = [piece.model_dump() for piece in request.pieces]

        # Initialize optimizer
        optimizer = CuttingOptimizer(kerf_width=request.settings.kerf_width)

        # Run optimization
        packed_sheets = optimizer.optimize(
            sheets=sheets,
            pieces=pieces,
            mode=request.settings.optimization_mode,
            grain_importance=request.settings.grain_importance
        )

        # Generate layouts
        layouts = []
        total_cuts = 0
        total_waste_area = Decimal(0)

        for sheet_idx, sheet_optimizer in enumerate(packed_sheets):
            # Generate cuts for this sheet
            cuts_data = optimizer.generate_cut_sequence(sheet_optimizer)
            total_cuts += len(cuts_data)

            # Convert cuts to schema
            cuts = [
                Cut(
                    sequence=cut['sequence'],
                    x1=Decimal(str(cut['x1'])),
                    y1=Decimal(str(cut['y1'])),
                    x2=Decimal(str(cut['x2'])),
                    y2=Decimal(str(cut['y2'])),
                    description=cut['description']
                )
                for cut in cuts_data
            ]

            # Convert placed pieces to schema
            placed_pieces = [
                PlacedPiece(
                    label=piece.label,
                    x=piece.x,
                    y=piece.y,
                    width=piece.width,
                    height=piece.height,
                    rotated=piece.rotated
                )
                for piece in sheet_optimizer.placed_pieces
            ]

            # Calculate waste for this sheet
            waste_area = sheet_optimizer.get_waste_area()
            waste_percentage = sheet_optimizer.get_waste_percentage()
            total_waste_area += waste_area

            layout = SheetLayout(
                sheet_index=sheet_idx,
                pieces=placed_pieces,
                cuts=cuts,
                waste_area=waste_area,
                waste_percentage=waste_percentage
            )
            layouts.append(layout)

        # Calculate statistics
        total_sheet_area = sum(
            Decimal(str(sheet['width'])) * Decimal(str(sheet['height']))
            for sheet in sheets
        ) * len(packed_sheets)

        total_waste_percentage = (total_waste_area / total_sheet_area * Decimal(100)) if total_sheet_area > 0 else Decimal(0)

        # Find largest offcut (simplified - just use first free rectangle from last sheet)
        largest_offcut_width = None
        largest_offcut_height = None
        if packed_sheets and packed_sheets[-1].free_rectangles:
            largest_free = max(
                packed_sheets[-1].free_rectangles,
                key=lambda r: float(r.width * r.height)
            )
            largest_offcut_width = largest_free.width
            largest_offcut_height = largest_free.height

        statistics = Statistics(
            total_waste_area=total_waste_area,
            total_waste_percentage=total_waste_percentage,
            total_cuts=total_cuts,
            sheets_used=len(packed_sheets),
            largest_offcut_width=largest_offcut_width,
            largest_offcut_height=largest_offcut_height,
            estimated_time_minutes=total_cuts * 2  # Estimate 2 minutes per cut
        )

        # Generate instructions
        instructions_data = optimizer.generate_instructions(packed_sheets)
        instructions = [
            Instruction(
                step=inst['step'],
                description=inst['description'],
                measurement=inst['measurement'],
                pieces_produced=inst['pieces_produced'],
                safety_note=inst.get('safety_note')
            )
            for inst in instructions_data
        ]

        return OptimizeResponse(
            layouts=layouts,
            statistics=statistics,
            instructions=instructions
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization failed: {str(e)}"
        )
