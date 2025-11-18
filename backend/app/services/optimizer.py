from typing import List, Tuple, Optional
from decimal import Decimal
from dataclasses import dataclass
import copy


@dataclass
class Rectangle:
    """Represents a rectangle with position and dimensions."""
    x: Decimal
    y: Decimal
    width: Decimal
    height: Decimal
    label: Optional[str] = None
    piece_index: Optional[int] = None
    rotated: bool = False


@dataclass
class FreeRectangle:
    """Represents available space in a sheet."""
    x: Decimal
    y: Decimal
    width: Decimal
    height: Decimal


class BinPackingOptimizer:
    """
    Implements guillotine bin packing algorithm for cutting optimization.
    Supports multiple optimization modes and grain direction constraints.
    """

    def __init__(
        self,
        sheet_width: Decimal,
        sheet_height: Decimal,
        kerf_width: Decimal = Decimal("0.125")
    ):
        self.sheet_width = sheet_width
        self.sheet_height = sheet_height
        self.kerf_width = kerf_width
        self.placed_pieces: List[Rectangle] = []
        self.free_rectangles: List[FreeRectangle] = [
            FreeRectangle(Decimal(0), Decimal(0), sheet_width, sheet_height)
        ]

    def can_fit(self, piece_width: Decimal, piece_height: Decimal, free_rect: FreeRectangle) -> bool:
        """Check if a piece can fit in a free rectangle."""
        return piece_width <= free_rect.width and piece_height <= free_rect.height

    def find_best_position(
        self,
        piece_width: Decimal,
        piece_height: Decimal,
        allow_rotation: bool = True
    ) -> Optional[Tuple[FreeRectangle, bool]]:
        """
        Find the best free rectangle for a piece using Best Area Fit strategy.
        Returns (free_rectangle, is_rotated) or None if no fit found.
        """
        best_rect = None
        best_area_diff = None
        rotated = False

        for free_rect in self.free_rectangles:
            # Try normal orientation
            if self.can_fit(piece_width, piece_height, free_rect):
                area_diff = (free_rect.width * free_rect.height) - (piece_width * piece_height)
                if best_area_diff is None or area_diff < best_area_diff:
                    best_area_diff = area_diff
                    best_rect = free_rect
                    rotated = False

            # Try rotated orientation
            if allow_rotation and self.can_fit(piece_height, piece_width, free_rect):
                area_diff = (free_rect.width * free_rect.height) - (piece_height * piece_width)
                if best_area_diff is None or area_diff < best_area_diff:
                    best_area_diff = area_diff
                    best_rect = free_rect
                    rotated = True

        if best_rect:
            return (best_rect, rotated)
        return None

    def split_free_rectangle(self, free_rect: FreeRectangle, placed: Rectangle):
        """
        Split a free rectangle after placing a piece (guillotine cut).
        Creates two new rectangles using the shorter leftover split.
        """
        self.free_rectangles.remove(free_rect)

        # Add kerf to the placed piece dimensions
        placed_width = placed.width + self.kerf_width
        placed_height = placed.height + self.kerf_width

        # Right rectangle
        if free_rect.width > placed_width:
            right_rect = FreeRectangle(
                x=free_rect.x + placed_width,
                y=free_rect.y,
                width=free_rect.width - placed_width,
                height=placed_height
            )
            self.free_rectangles.append(right_rect)

        # Top rectangle
        if free_rect.height > placed_height:
            top_rect = FreeRectangle(
                x=free_rect.x,
                y=free_rect.y + placed_height,
                width=free_rect.width,
                height=free_rect.height - placed_height
            )
            self.free_rectangles.append(top_rect)

    def place_piece(
        self,
        piece_width: Decimal,
        piece_height: Decimal,
        label: Optional[str] = None,
        piece_index: Optional[int] = None,
        allow_rotation: bool = True
    ) -> bool:
        """
        Try to place a piece on the sheet.
        Returns True if successful, False otherwise.
        """
        result = self.find_best_position(piece_width, piece_height, allow_rotation)

        if result is None:
            return False

        free_rect, rotated = result

        # Adjust dimensions if rotated
        final_width = piece_height if rotated else piece_width
        final_height = piece_width if rotated else piece_height

        # Create placed rectangle
        placed = Rectangle(
            x=free_rect.x,
            y=free_rect.y,
            width=final_width,
            height=final_height,
            label=label,
            piece_index=piece_index,
            rotated=rotated
        )

        self.placed_pieces.append(placed)
        self.split_free_rectangle(free_rect, placed)

        return True

    def get_waste_area(self) -> Decimal:
        """Calculate total waste area on the sheet."""
        used_area = sum(p.width * p.height for p in self.placed_pieces)
        total_area = self.sheet_width * self.sheet_height
        return total_area - used_area

    def get_waste_percentage(self) -> Decimal:
        """Calculate waste percentage."""
        total_area = self.sheet_width * self.sheet_height
        if total_area == 0:
            return Decimal(0)
        waste_area = self.get_waste_area()
        return (waste_area / total_area) * Decimal(100)


class CuttingOptimizer:
    """
    High-level optimizer that manages multiple sheets and pieces.
    Implements different optimization strategies.
    """

    def __init__(self, kerf_width: Decimal = Decimal("0.125")):
        self.kerf_width = kerf_width

    def optimize(
        self,
        sheets: List[dict],
        pieces: List[dict],
        mode: str = "waste",
        grain_importance: str = "medium"
    ) -> List[BinPackingOptimizer]:
        """
        Main optimization function.

        Args:
            sheets: List of sheet specifications
            pieces: List of piece specifications
            mode: Optimization mode ("waste", "cuts", "sheets", "grain", "balanced")
            grain_importance: How important grain matching is

        Returns:
            List of BinPackingOptimizer instances, one per sheet used
        """
        # Sort pieces based on optimization mode
        if mode == "waste":
            # Largest area first for best packing density
            sorted_pieces = sorted(
                pieces,
                key=lambda p: float(p['width']) * float(p['height']),
                reverse=True
            )
        elif mode == "cuts":
            # Sort by perimeter (smallest first) to minimize total cut length
            sorted_pieces = sorted(
                pieces,
                key=lambda p: 2 * (float(p['width']) + float(p['height'])),
                reverse=False
            )
        elif mode == "sheets":
            # Largest first, but prioritize pieces that are similar in one dimension
            # to enable better nesting
            sorted_pieces = sorted(
                pieces,
                key=lambda p: (
                    -float(p['width']) * float(p['height']),  # Area descending
                    -max(float(p['width']), float(p['height']))  # Longest dimension descending
                ),
            )
        elif mode == "grain":
            # Group by grain direction, then by area
            sorted_pieces = sorted(
                pieces,
                key=lambda p: (
                    p.get('grain_direction', 'none'),
                    -float(p['width']) * float(p['height'])
                )
            )
        else:  # balanced
            # Balanced approach: sort by longest dimension to improve both packing and cuts
            sorted_pieces = sorted(
                pieces,
                key=lambda p: -max(float(p['width']), float(p['height']))
            )

        # Expand pieces based on quantity
        expanded_pieces = []
        for i, piece in enumerate(sorted_pieces):
            for q in range(piece['quantity']):
                expanded_pieces.append({
                    **piece,
                    'original_index': i,
                    'instance': q
                })

        # Get sheet dimensions (assuming all sheets are the same for MVP)
        sheet = sheets[0]
        sheet_width = Decimal(str(sheet['width']))
        sheet_height = Decimal(str(sheet['height']))
        has_grain = sheet.get('has_grain', False)

        # Create list to store packed sheets
        packed_sheets: List[BinPackingOptimizer] = []

        # Pack pieces using First Fit Decreasing
        for piece in expanded_pieces:
            piece_width = Decimal(str(piece['width']))
            piece_height = Decimal(str(piece['height']))
            label = piece.get('label', f"Piece {piece['original_index'] + 1}")

            # Determine if rotation is allowed based on grain
            allow_rotation = True
            if has_grain and grain_importance in ['high', 'medium']:
                grain_dir = piece.get('grain_direction', 'none')
                if grain_dir in ['parallel', 'perpendicular']:
                    allow_rotation = False

            # Try to place on existing sheets
            placed = False
            for sheet_optimizer in packed_sheets:
                if sheet_optimizer.place_piece(
                    piece_width,
                    piece_height,
                    label=label,
                    piece_index=piece['original_index'],
                    allow_rotation=allow_rotation
                ):
                    placed = True
                    break

            # If not placed, create a new sheet
            if not placed:
                new_sheet = BinPackingOptimizer(sheet_width, sheet_height, self.kerf_width)
                if new_sheet.place_piece(
                    piece_width,
                    piece_height,
                    label=label,
                    piece_index=piece['original_index'],
                    allow_rotation=allow_rotation
                ):
                    packed_sheets.append(new_sheet)
                else:
                    # Piece doesn't fit on a single sheet - this is an error condition
                    raise ValueError(
                        f"Piece {label} ({piece_width} x {piece_height}) "
                        f"is too large for sheet ({sheet_width} x {sheet_height})"
                    )

        return packed_sheets

    def generate_cut_sequence(self, optimizer: BinPackingOptimizer) -> List[dict]:
        """
        Generate a sequential cutting plan for pieces on a sheet.
        Optimized for tools without fences (circular saw, track saw).
        Combines adjacent cuts that share the same edge into single longer cuts.
        """
        # Collect all edge segments from pieces
        edge_segments = []

        for piece in optimizer.placed_pieces:
            x1, y1 = float(piece.x), float(piece.y)
            x2, y2 = float(piece.x + piece.width), float(piece.y + piece.height)

            # Add all four edges with their piece label
            edge_segments.append({
                'type': 'vertical',
                'position': x1,
                'start': y1,
                'end': y2,
                'label': piece.label
            })
            edge_segments.append({
                'type': 'vertical',
                'position': x2,
                'start': y1,
                'end': y2,
                'label': piece.label
            })
            edge_segments.append({
                'type': 'horizontal',
                'position': y1,
                'start': x1,
                'end': x2,
                'label': piece.label
            })
            edge_segments.append({
                'type': 'horizontal',
                'position': y2,
                'start': x1,
                'end': x2,
                'label': piece.label
            })

        # Group by type and position to find overlapping segments
        from collections import defaultdict
        grouped_edges = defaultdict(list)

        for edge in edge_segments:
            key = (edge['type'], edge['position'])
            grouped_edges[key].append(edge)

        # Combine overlapping segments into continuous cuts
        combined_cuts = []

        for (edge_type, position), segments in grouped_edges.items():
            # Sort segments by start position
            segments.sort(key=lambda s: s['start'])

            # Merge overlapping or adjacent segments
            merged = []
            current_start = segments[0]['start']
            current_end = segments[0]['end']
            labels = [segments[0]['label']]

            for seg in segments[1:]:
                # If segments overlap or are adjacent (within kerf tolerance)
                if seg['start'] <= current_end + float(self.kerf_width):
                    current_end = max(current_end, seg['end'])
                    if seg['label'] not in labels:
                        labels.append(seg['label'])
                else:
                    # Save current merged segment
                    merged.append({
                        'start': current_start,
                        'end': current_end,
                        'labels': labels
                    })
                    # Start new segment
                    current_start = seg['start']
                    current_end = seg['end']
                    labels = [seg['label']]

            # Add the last segment
            merged.append({
                'start': current_start,
                'end': current_end,
                'labels': labels
            })

            # Create cut instructions from merged segments
            for seg in merged:
                if edge_type == 'vertical':
                    combined_cuts.append({
                        'x1': Decimal(str(position)),
                        'y1': Decimal(str(seg['start'])),
                        'x2': Decimal(str(position)),
                        'y2': Decimal(str(seg['end'])),
                        'description': f"Vertical cut at x={position:.1f}\" for {', '.join(seg['labels'][:2])}{'...' if len(seg['labels']) > 2 else ''}"
                    })
                else:  # horizontal
                    combined_cuts.append({
                        'x1': Decimal(str(seg['start'])),
                        'y1': Decimal(str(position)),
                        'x2': Decimal(str(seg['end'])),
                        'y2': Decimal(str(position)),
                        'description': f"Horizontal cut at y={position:.1f}\" for {', '.join(seg['labels'][:2])}{'...' if len(seg['labels']) > 2 else ''}"
                    })

        # Sort cuts for logical sequence (left to right, bottom to top)
        combined_cuts.sort(key=lambda c: (float(c['y1']) + float(c['y2'])) / 2)  # Sort by average Y
        combined_cuts.sort(key=lambda c: (float(c['x1']) + float(c['x2'])) / 2)  # Then by average X

        # Add sequence numbers
        for i, cut in enumerate(combined_cuts, start=1):
            cut['sequence'] = i

        return combined_cuts

    def generate_instructions(self, packed_sheets: List[BinPackingOptimizer]) -> List[dict]:
        """Generate step-by-step cutting instructions."""
        instructions = []
        step = 1

        for sheet_idx, sheet in enumerate(packed_sheets):
            instructions.append({
                'step': step,
                'description': f"Start with Sheet #{sheet_idx + 1}",
                'measurement': f"{sheet.sheet_width}\" x {sheet.sheet_height}\"",
                'pieces_produced': [],
                'safety_note': "Ensure sheet is properly supported"
            })
            step += 1

            cuts = self.generate_cut_sequence(sheet)

            for cut in cuts:
                pieces = [p.label for p in sheet.placed_pieces]
                instructions.append({
                    'step': step,
                    'description': cut['description'],
                    'measurement': f"From ({cut['x1']}\", {cut['y1']}\") to ({cut['x2']}\", {cut['y2']}\")",
                    'pieces_produced': pieces[:2],  # Show first 2 pieces
                    'safety_note': "Support offcuts to prevent binding"
                })
                step += 1

        return instructions
