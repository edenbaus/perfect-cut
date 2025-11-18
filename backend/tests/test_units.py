"""
Unit tests for unit conversion utilities.
"""

import pytest
from decimal import Decimal
from app.utils.units import (
    inches_to_mm,
    inches_to_cm,
    mm_to_inches,
    cm_to_inches,
    format_measurement,
    parse_measurement,
    get_unit_label,
    get_unit_symbol,
)


class TestInchesToMetric:
    """Test conversions from inches to metric units."""

    def test_inches_to_mm(self):
        """Test inches to millimeters conversion."""
        assert inches_to_mm(1) == Decimal("25.4")
        assert inches_to_mm(0) == Decimal("0")
        assert inches_to_mm(10) == Decimal("254")

    def test_inches_to_mm_decimal(self):
        """Test inches to millimeters with decimal input."""
        result = inches_to_mm(Decimal("2.5"))
        assert result == Decimal("63.5")

    def test_inches_to_cm(self):
        """Test inches to centimeters conversion."""
        assert inches_to_cm(1) == Decimal("2.54")
        assert inches_to_cm(0) == Decimal("0")
        assert inches_to_cm(10) == Decimal("25.4")

    def test_inches_to_cm_decimal(self):
        """Test inches to centimeters with decimal input."""
        result = inches_to_cm(Decimal("2.5"))
        assert result == Decimal("6.35")


class TestMetricToInches:
    """Test conversions from metric units to inches."""

    def test_mm_to_inches(self):
        """Test millimeters to inches conversion."""
        result = mm_to_inches(25.4)
        assert abs(result - Decimal("1")) < Decimal("0.0001")

    def test_mm_to_inches_zero(self):
        """Test millimeters to inches with zero."""
        assert mm_to_inches(0) == Decimal("0")

    def test_mm_to_inches_large(self):
        """Test millimeters to inches with large value."""
        result = mm_to_inches(254)
        assert abs(result - Decimal("10")) < Decimal("0.0001")

    def test_cm_to_inches(self):
        """Test centimeters to inches conversion."""
        result = cm_to_inches(2.54)
        assert abs(result - Decimal("1")) < Decimal("0.0001")

    def test_cm_to_inches_zero(self):
        """Test centimeters to inches with zero."""
        assert cm_to_inches(0) == Decimal("0")

    def test_cm_to_inches_large(self):
        """Test centimeters to inches with large value."""
        result = cm_to_inches(25.4)
        assert abs(result - Decimal("10")) < Decimal("0.0001")


class TestRoundTripConversions:
    """Test that conversions are reversible."""

    def test_inches_to_mm_and_back(self):
        """Test inches -> mm -> inches round trip."""
        original = Decimal("12.5")
        mm = inches_to_mm(original)
        back = mm_to_inches(mm)
        assert abs(back - original) < Decimal("0.0001")

    def test_inches_to_cm_and_back(self):
        """Test inches -> cm -> inches round trip."""
        original = Decimal("12.5")
        cm = inches_to_cm(original)
        back = cm_to_inches(cm)
        assert abs(back - original) < Decimal("0.0001")


class TestFormatMeasurement:
    """Test measurement formatting."""

    def test_format_imperial(self):
        """Test formatting imperial measurements."""
        result = format_measurement(12.5, "imperial", 2)
        assert result == '12.50"'

    def test_format_metric(self):
        """Test formatting metric measurements."""
        result = format_measurement(1, "metric", 2)
        assert result == "25.40 mm"

    def test_format_metric_large(self):
        """Test formatting larger metric measurements."""
        result = format_measurement(10, "metric", 1)
        assert result == "254.0 mm"

    def test_format_default_imperial(self):
        """Test default formatting is imperial."""
        result = format_measurement(5)
        assert '"' in result

    def test_format_precision(self):
        """Test formatting precision."""
        result = format_measurement(12.123456, "imperial", 3)
        assert result == '12.123"'


class TestParseMeasurement:
    """Test measurement parsing."""

    def test_parse_imperial(self):
        """Test parsing imperial measurements."""
        result = parse_measurement("12.5", "imperial")
        assert result == Decimal("12.5")

    def test_parse_imperial_with_quotes(self):
        """Test parsing imperial measurements with quotes."""
        result = parse_measurement('12.5"', "imperial")
        assert result == Decimal("12.5")

    def test_parse_metric_mm(self):
        """Test parsing metric measurements (mm)."""
        result = parse_measurement("254", "metric")
        # Should assume mm for large values
        expected = mm_to_inches(Decimal("254"))
        assert abs(result - expected) < Decimal("0.0001")

    def test_parse_metric_cm(self):
        """Test parsing metric measurements (cm)."""
        result = parse_measurement("25.4", "metric")
        # Should assume cm for smaller values
        expected = cm_to_inches(Decimal("25.4"))
        assert abs(result - expected) < Decimal("0.0001")

    def test_parse_metric_with_unit(self):
        """Test parsing metric measurements with units."""
        result = parse_measurement("254 mm", "metric")
        expected = mm_to_inches(Decimal("254"))
        assert abs(result - expected) < Decimal("0.0001")


class TestUtilityFunctions:
    """Test utility functions."""

    def test_get_unit_label_imperial(self):
        """Test getting imperial unit label."""
        assert get_unit_label("imperial") == "inches"

    def test_get_unit_label_metric(self):
        """Test getting metric unit label."""
        assert get_unit_label("metric") == "mm"

    def test_get_unit_symbol_imperial(self):
        """Test getting imperial unit symbol."""
        assert get_unit_symbol("imperial") == '"'

    def test_get_unit_symbol_metric(self):
        """Test getting metric unit symbol."""
        assert get_unit_symbol("metric") == "mm"


class TestEdgeCases:
    """Test edge cases and error handling."""

    def test_negative_values(self):
        """Test handling of negative values."""
        result = inches_to_mm(-5)
        assert result == Decimal("-127.0")

    def test_very_large_values(self):
        """Test handling of very large values."""
        result = inches_to_mm(1000)
        assert result == Decimal("25400")

    def test_very_small_values(self):
        """Test handling of very small values."""
        result = inches_to_mm(Decimal("0.001"))
        assert result == Decimal("0.0254")

    def test_float_inputs(self):
        """Test that float inputs are handled correctly."""
        result = inches_to_mm(1.5)
        assert result == Decimal("38.1")

    def test_int_inputs(self):
        """Test that integer inputs are handled correctly."""
        result = inches_to_mm(2)
        assert result == Decimal("50.8")
