"""
Unit conversion utilities for imperial and metric measurements.

Supports conversion between:
- Inches (imperial) ↔ Millimeters (metric)
- Inches (imperial) ↔ Centimeters (metric)
"""

from decimal import Decimal
from typing import Union

# Conversion constants
INCHES_TO_MM = Decimal("25.4")
INCHES_TO_CM = Decimal("2.54")
MM_TO_INCHES = Decimal("1") / INCHES_TO_MM
CM_TO_INCHES = Decimal("1") / INCHES_TO_CM


def inches_to_mm(inches: Union[Decimal, float, int]) -> Decimal:
    """
    Convert inches to millimeters.

    Args:
        inches: Measurement in inches

    Returns:
        Measurement in millimeters
    """
    if not isinstance(inches, Decimal):
        inches = Decimal(str(inches))
    return inches * INCHES_TO_MM


def inches_to_cm(inches: Union[Decimal, float, int]) -> Decimal:
    """
    Convert inches to centimeters.

    Args:
        inches: Measurement in inches

    Returns:
        Measurement in centimeters
    """
    if not isinstance(inches, Decimal):
        inches = Decimal(str(inches))
    return inches * INCHES_TO_CM


def mm_to_inches(mm: Union[Decimal, float, int]) -> Decimal:
    """
    Convert millimeters to inches.

    Args:
        mm: Measurement in millimeters

    Returns:
        Measurement in inches
    """
    if not isinstance(mm, Decimal):
        mm = Decimal(str(mm))
    return mm * MM_TO_INCHES


def cm_to_inches(cm: Union[Decimal, float, int]) -> Decimal:
    """
    Convert centimeters to inches.

    Args:
        cm: Measurement in centimeters

    Returns:
        Measurement in inches
    """
    if not isinstance(cm, Decimal):
        cm = Decimal(str(cm))
    return cm * CM_TO_INCHES


def format_measurement(
    value: Union[Decimal, float, int],
    unit_system: str = "imperial",
    precision: int = 2
) -> str:
    """
    Format a measurement with appropriate units.

    Assumes input is always in inches (internal storage format).
    Converts to metric if unit_system is "metric".

    Args:
        value: Measurement value (in inches)
        unit_system: "imperial" or "metric"
        precision: Number of decimal places

    Returns:
        Formatted string with units (e.g., "12.50\"" or "317.5 mm")
    """
    if not isinstance(value, Decimal):
        value = Decimal(str(value))

    if unit_system == "metric":
        mm_value = inches_to_mm(value)
        return f"{mm_value:.{precision}f} mm"
    else:
        return f'{value:.{precision}f}"'


def parse_measurement(
    value_str: str,
    unit_system: str = "imperial"
) -> Decimal:
    """
    Parse a measurement string to internal format (inches).

    Args:
        value_str: Measurement string (e.g., "12.5" or "317.5")
        unit_system: "imperial" or "metric"

    Returns:
        Measurement in inches (internal format)
    """
    # Remove units and whitespace
    clean_str = value_str.strip().replace('"', '').replace('mm', '').replace('cm', '').strip()
    value = Decimal(clean_str)

    # Convert to inches if metric
    if unit_system == "metric":
        # Assume mm if > 100, cm if <= 100 (heuristic)
        if value > 100:
            return mm_to_inches(value)
        else:
            return cm_to_inches(value)
    else:
        return value


def get_unit_label(unit_system: str = "imperial") -> str:
    """
    Get the display label for the unit system.

    Args:
        unit_system: "imperial" or "metric"

    Returns:
        Display label (e.g., "inches" or "mm")
    """
    return "inches" if unit_system == "imperial" else "mm"


def get_unit_symbol(unit_system: str = "imperial") -> str:
    """
    Get the symbol for the unit system.

    Args:
        unit_system: "imperial" or "metric"

    Returns:
        Unit symbol (e.g., "\"" or "mm")
    """
    return '"' if unit_system == "imperial" else "mm"
