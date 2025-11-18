/**
 * Unit conversion utilities for imperial and metric measurements.
 *
 * Supports conversion between:
 * - Inches (imperial) ↔ Millimeters (metric)
 * - Inches (imperial) ↔ Centimeters (metric)
 */

export type UnitSystem = 'imperial' | 'metric'

// Conversion constants
const INCHES_TO_MM = 25.4
const INCHES_TO_CM = 2.54
const MM_TO_INCHES = 1 / INCHES_TO_MM
const CM_TO_INCHES = 1 / INCHES_TO_CM

/**
 * Convert inches to millimeters
 */
export function inchesToMm(inches: number): number {
  return inches * INCHES_TO_MM
}

/**
 * Convert inches to centimeters
 */
export function inchesToCm(inches: number): number {
  return inches * INCHES_TO_CM
}

/**
 * Convert millimeters to inches
 */
export function mmToInches(mm: number): number {
  return mm * MM_TO_INCHES
}

/**
 * Convert centimeters to inches
 */
export function cmToInches(cm: number): number {
  return cm * CM_TO_INCHES
}

/**
 * Format a measurement with appropriate units.
 * Assumes input is always in inches (internal storage format).
 * Converts to metric if unitSystem is "metric".
 */
export function formatMeasurement(
  value: number,
  unitSystem: UnitSystem = 'imperial',
  precision: number = 2
): string {
  if (unitSystem === 'metric') {
    const mmValue = inchesToMm(value)
    return `${mmValue.toFixed(precision)} mm`
  } else {
    return `${value.toFixed(precision)}"`
  }
}

/**
 * Parse a measurement string to internal format (inches).
 */
export function parseMeasurement(
  valueStr: string,
  unitSystem: UnitSystem = 'imperial'
): number {
  // Remove units and whitespace
  const cleanStr = valueStr.trim().replace(/['"]/g, '').replace(/mm/g, '').replace(/cm/g, '').trim()
  const value = parseFloat(cleanStr)

  if (isNaN(value)) {
    throw new Error(`Invalid measurement: ${valueStr}`)
  }

  // Convert to inches if metric
  if (unitSystem === 'metric') {
    // Assume mm if > 100, cm if <= 100 (heuristic)
    if (value > 100) {
      return mmToInches(value)
    } else {
      return cmToInches(value)
    }
  } else {
    return value
  }
}

/**
 * Convert a value from internal format (inches) to display format
 */
export function toDisplayValue(
  inches: number | string | null | undefined,
  unitSystem: UnitSystem = 'imperial',
  precision: number = 2
): number {
  // Convert string to number if needed (Decimal from backend serializes as string)
  const numericValue = typeof inches === 'string' ? parseFloat(inches) : inches

  // Handle undefined, null, or NaN values
  if (numericValue === undefined || numericValue === null || isNaN(numericValue)) {
    return 0
  }

  if (unitSystem === 'metric') {
    return parseFloat(inchesToMm(numericValue).toFixed(precision))
  } else {
    return parseFloat(numericValue.toFixed(precision))
  }
}

/**
 * Convert a value from display format to internal format (inches)
 */
export function toInternalValue(
  displayValue: number | string | null | undefined,
  unitSystem: UnitSystem = 'imperial'
): number {
  // Convert string to number if needed
  const numericValue = typeof displayValue === 'string' ? parseFloat(displayValue) : displayValue

  // Handle undefined, null, or NaN values
  if (numericValue === undefined || numericValue === null || isNaN(numericValue)) {
    return 0
  }

  if (unitSystem === 'metric') {
    return mmToInches(numericValue)
  } else {
    return numericValue
  }
}

/**
 * Get the display label for the unit system
 */
export function getUnitLabel(unitSystem: UnitSystem = 'imperial'): string {
  return unitSystem === 'imperial' ? 'inches' : 'mm'
}

/**
 * Get the symbol for the unit system
 */
export function getUnitSymbol(unitSystem: UnitSystem = 'imperial'): string {
  return unitSystem === 'imperial' ? '"' : 'mm'
}

/**
 * Get the step value for input fields based on unit system
 */
export function getInputStep(unitSystem: UnitSystem = 'imperial'): number {
  return unitSystem === 'imperial' ? 0.125 : 1 // 1/8 inch or 1mm
}
