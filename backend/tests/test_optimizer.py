"""
Unit tests for the cutting optimization algorithms.
"""

import pytest
from decimal import Decimal
from app.services.optimizer import (
    Rectangle,
    FreeRectangle,
    BinPackingOptimizer,
    CuttingOptimizer,
)


class TestRectangle:
    """Test Rectangle dataclass."""

    def test_rectangle_creation(self):
        """Test creating a rectangle."""
        rect = Rectangle(
            x=Decimal("0"),
            y=Decimal("0"),
            width=Decimal("10"),
            height=Decimal("20"),
        )
        assert rect.x == Decimal("0")
        assert rect.y == Decimal("0")
        assert rect.width == Decimal("10")
        assert rect.height == Decimal("20")

    def test_rectangle_with_label(self):
        """Test creating a rectangle with label."""
        rect = Rectangle(
            x=Decimal("0"),
            y=Decimal("0"),
            width=Decimal("10"),
            height=Decimal("20"),
            label="Test Piece",
        )
        assert rect.label == "Test Piece"

    def test_rectangle_rotated(self):
        """Test rectangle rotation flag."""
        rect = Rectangle(
            x=Decimal("0"),
            y=Decimal("0"),
            width=Decimal("10"),
            height=Decimal("20"),
            rotated=True,
        )
        assert rect.rotated is True


class TestFreeRectangle:
    """Test FreeRectangle dataclass."""

    def test_free_rectangle_creation(self):
        """Test creating a free rectangle."""
        free_rect = FreeRectangle(
            x=Decimal("0"),
            y=Decimal("0"),
            width=Decimal("96"),
            height=Decimal("48"),
        )
        assert free_rect.width == Decimal("96")
        assert free_rect.height == Decimal("48")


class TestBinPackingOptimizer:
    """Test BinPackingOptimizer class."""

    def test_optimizer_initialization(self):
        """Test initializing the optimizer."""
        optimizer = BinPackingOptimizer(
            sheet_width=Decimal("96"),
            sheet_height=Decimal("48"),
            kerf_width=Decimal("0.125"),
        )
        assert optimizer.sheet_width == Decimal("96")
        assert optimizer.sheet_height == Decimal("48")
        assert optimizer.kerf_width == Decimal("0.125")
        assert len(optimizer.free_rectangles) == 1
        assert len(optimizer.placed_pieces) == 0

    def test_can_fit_exact(self):
        """Test checking if a piece fits exactly."""
        optimizer = BinPackingOptimizer(
            sheet_width=Decimal("96"),
            sheet_height=Decimal("48"),
        )
        free_rect = optimizer.free_rectangles[0]
        assert optimizer.can_fit(Decimal("96"), Decimal("48"), free_rect)

    def test_can_fit_smaller(self):
        """Test checking if a smaller piece fits."""
        optimizer = BinPackingOptimizer(
            sheet_width=Decimal("96"),
            sheet_height=Decimal("48"),
        )
        free_rect = optimizer.free_rectangles[0]
        assert optimizer.can_fit(Decimal("10"), Decimal("10"), free_rect)

    def test_cannot_fit_larger(self):
        """Test checking if a larger piece does not fit."""
        optimizer = BinPackingOptimizer(
            sheet_width=Decimal("96"),
            sheet_height=Decimal("48"),
        )
        free_rect = optimizer.free_rectangles[0]
        assert not optimizer.can_fit(Decimal("100"), Decimal("50"), free_rect)

    def test_cannot_fit_wider(self):
        """Test piece that is too wide."""
        optimizer = BinPackingOptimizer(
            sheet_width=Decimal("96"),
            sheet_height=Decimal("48"),
        )
        free_rect = optimizer.free_rectangles[0]
        assert not optimizer.can_fit(Decimal("100"), Decimal("10"), free_rect)

    def test_cannot_fit_taller(self):
        """Test piece that is too tall."""
        optimizer = BinPackingOptimizer(
            sheet_width=Decimal("96"),
            sheet_height=Decimal("48"),
        )
        free_rect = optimizer.free_rectangles[0]
        assert not optimizer.can_fit(Decimal("10"), Decimal("50"), free_rect)

    def test_find_best_position_single_piece(self):
        """Test finding position for a single piece."""
        optimizer = BinPackingOptimizer(
            sheet_width=Decimal("96"),
            sheet_height=Decimal("48"),
        )
        result = optimizer.find_best_position(Decimal("24"), Decimal("24"))
        assert result is not None
        free_rect, rotated = result
        assert free_rect is not None
        assert isinstance(rotated, bool)

    def test_find_best_position_rotation(self):
        """Test finding position with rotation allowed."""
        optimizer = BinPackingOptimizer(
            sheet_width=Decimal("10"),
            sheet_height=Decimal("20"),
        )
        result = optimizer.find_best_position(
            Decimal("15"), Decimal("5"), allow_rotation=True
        )
        assert result is not None
        free_rect, rotated = result
        # Should rotate because 15x5 doesn't fit, but 5x15 does
        assert rotated is True

    def test_find_best_position_no_rotation(self):
        """Test finding position with rotation disabled."""
        optimizer = BinPackingOptimizer(
            sheet_width=Decimal("10"),
            sheet_height=Decimal("20"),
        )
        result = optimizer.find_best_position(
            Decimal("15"), Decimal("5"), allow_rotation=False
        )
        # Should not find a position because rotation is disabled
        assert result is None

    def test_place_piece(self):
        """Test placing a piece on the sheet."""
        optimizer = BinPackingOptimizer(
            sheet_width=Decimal("96"),
            sheet_height=Decimal("48"),
            kerf_width=Decimal("0.125"),
        )
        success = optimizer.place_piece(Decimal("24"), Decimal("24"), "Test Piece")
        assert success is True
        assert len(optimizer.placed_pieces) == 1
        assert optimizer.placed_pieces[0].label == "Test Piece"

    def test_place_multiple_pieces(self):
        """Test placing multiple pieces."""
        optimizer = BinPackingOptimizer(
            sheet_width=Decimal("96"),
            sheet_height=Decimal("48"),
            kerf_width=Decimal("0.125"),
        )
        # Place first piece
        success1 = optimizer.place_piece(Decimal("24"), Decimal("24"), "Piece 1")
        assert success1 is True

        # Place second piece
        success2 = optimizer.place_piece(Decimal("24"), Decimal("24"), "Piece 2")
        assert success2 is True

        assert len(optimizer.placed_pieces) == 2

    def test_place_piece_too_large(self):
        """Test placing a piece that is too large."""
        optimizer = BinPackingOptimizer(
            sheet_width=Decimal("96"),
            sheet_height=Decimal("48"),
        )
        success = optimizer.place_piece(Decimal("100"), Decimal("50"), "Too Big")
        assert success is False
        assert len(optimizer.placed_pieces) == 0

    def test_get_usage(self):
        """Test getting sheet usage percentage."""
        optimizer = BinPackingOptimizer(
            sheet_width=Decimal("96"),
            sheet_height=Decimal("48"),
        )
        # Empty sheet
        assert optimizer.get_usage() == Decimal("0")

        # Place a piece
        optimizer.place_piece(Decimal("48"), Decimal("24"))
        usage = optimizer.get_usage()
        # 48 * 24 = 1152, sheet is 96 * 48 = 4608
        # usage = 1152 / 4608 = 0.25 = 25%
        assert usage == Decimal("25")

    def test_kerf_width_affects_placement(self):
        """Test that kerf width is accounted for in placement."""
        # With no kerf, should fit 4 pieces of 24x24 in a 48x48 sheet
        optimizer_no_kerf = BinPackingOptimizer(
            sheet_width=Decimal("48"),
            sheet_height=Decimal("48"),
            kerf_width=Decimal("0"),
        )
        count_no_kerf = 0
        for _ in range(10):
            if optimizer_no_kerf.place_piece(Decimal("24"), Decimal("24")):
                count_no_kerf += 1

        # With kerf, should fit fewer pieces
        optimizer_with_kerf = BinPackingOptimizer(
            sheet_width=Decimal("48"),
            sheet_height=Decimal("48"),
            kerf_width=Decimal("0.125"),
        )
        count_with_kerf = 0
        for _ in range(10):
            if optimizer_with_kerf.place_piece(Decimal("24"), Decimal("24")):
                count_with_kerf += 1

        # Should fit fewer pieces with kerf
        assert count_with_kerf < count_no_kerf


class TestCuttingOptimizer:
    """Test CuttingOptimizer class."""

    def test_cutting_optimizer_initialization(self):
        """Test initializing the cutting optimizer."""
        sheets = [
            {"width": Decimal("96"), "height": Decimal("48"), "quantity": 1}
        ]
        pieces = [
            {"width": Decimal("24"), "height": Decimal("24"), "quantity": 1, "label": "Test"}
        ]
        optimizer = CuttingOptimizer(sheets, pieces)
        assert optimizer is not None

    def test_optimize_single_piece(self):
        """Test optimizing a single piece."""
        sheets = [
            {"width": Decimal("96"), "height": Decimal("48"), "quantity": 1}
        ]
        pieces = [
            {"width": Decimal("24"), "height": Decimal("24"), "quantity": 1, "label": "Test"}
        ]
        optimizer = CuttingOptimizer(sheets, pieces)
        result = optimizer.optimize()
        assert result is not None
        assert len(result["layouts"]) > 0
        assert result["statistics"]["sheets_used"] == 1

    def test_optimize_multiple_pieces_one_sheet(self):
        """Test optimizing multiple pieces on one sheet."""
        sheets = [
            {"width": Decimal("96"), "height": Decimal("48"), "quantity": 1}
        ]
        pieces = [
            {"width": Decimal("24"), "height": Decimal("24"), "quantity": 4, "label": "Small"}
        ]
        optimizer = CuttingOptimizer(sheets, pieces)
        result = optimizer.optimize()
        assert result is not None
        assert result["statistics"]["sheets_used"] == 1
        assert len(result["layouts"][0]["pieces"]) == 4

    def test_optimize_multiple_sheets(self):
        """Test optimization requiring multiple sheets."""
        sheets = [
            {"width": Decimal("48"), "height": Decimal("48"), "quantity": 5}
        ]
        pieces = [
            {"width": Decimal("40"), "height": Decimal("40"), "quantity": 3, "label": "Large"}
        ]
        optimizer = CuttingOptimizer(sheets, pieces)
        result = optimizer.optimize()
        assert result is not None
        # Should need multiple sheets
        assert result["statistics"]["sheets_used"] >= 3

    def test_optimize_with_grain_direction(self):
        """Test optimization with grain direction constraints."""
        sheets = [
            {"width": Decimal("96"), "height": Decimal("48"), "quantity": 1, "has_grain": True}
        ]
        pieces = [
            {
                "width": Decimal("24"),
                "height": Decimal("12"),
                "quantity": 1,
                "label": "Grain Horizontal",
                "grain_direction": "horizontal",
            }
        ]
        optimizer = CuttingOptimizer(sheets, pieces)
        result = optimizer.optimize()
        assert result is not None
        # Should place the piece
        assert len(result["layouts"][0]["pieces"]) == 1

    def test_statistics_calculation(self):
        """Test that statistics are calculated correctly."""
        sheets = [
            {"width": Decimal("96"), "height": Decimal("48"), "quantity": 1}
        ]
        pieces = [
            {"width": Decimal("48"), "height": Decimal("24"), "quantity": 1, "label": "Half"}
        ]
        optimizer = CuttingOptimizer(sheets, pieces)
        result = optimizer.optimize()
        stats = result["statistics"]

        assert "total_waste_area" in stats
        assert "total_waste_percentage" in stats
        assert "total_cuts" in stats
        assert "sheets_used" in stats

        # Half the sheet is used, so waste should be approximately 50%
        waste_pct = float(stats["total_waste_percentage"])
        assert 45 < waste_pct < 55
