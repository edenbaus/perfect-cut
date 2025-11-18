/**
 * Unit tests for unit conversion utilities.
 */

import { describe, it, expect } from 'vitest'
import {
  inchesToMm,
  inchesToCm,
  mmToInches,
  cmToInches,
  formatMeasurement,
  parseMeasurement,
  toDisplayValue,
  toInternalValue,
  getUnitLabel,
  getUnitSymbol,
  getInputStep,
} from './units'

describe('Unit Conversions', () => {
  describe('inchesToMm', () => {
    it('converts 1 inch to 25.4 mm', () => {
      expect(inchesToMm(1)).toBeCloseTo(25.4, 2)
    })

    it('converts 0 inches to 0 mm', () => {
      expect(inchesToMm(0)).toBe(0)
    })

    it('converts 10 inches to 254 mm', () => {
      expect(inchesToMm(10)).toBeCloseTo(254, 2)
    })

    it('converts 2.5 inches to 63.5 mm', () => {
      expect(inchesToMm(2.5)).toBeCloseTo(63.5, 2)
    })
  })

  describe('inchesToCm', () => {
    it('converts 1 inch to 2.54 cm', () => {
      expect(inchesToCm(1)).toBeCloseTo(2.54, 2)
    })

    it('converts 0 inches to 0 cm', () => {
      expect(inchesToCm(0)).toBe(0)
    })

    it('converts 10 inches to 25.4 cm', () => {
      expect(inchesToCm(10)).toBeCloseTo(25.4, 2)
    })
  })

  describe('mmToInches', () => {
    it('converts 25.4 mm to 1 inch', () => {
      expect(mmToInches(25.4)).toBeCloseTo(1, 4)
    })

    it('converts 0 mm to 0 inches', () => {
      expect(mmToInches(0)).toBe(0)
    })

    it('converts 254 mm to 10 inches', () => {
      expect(mmToInches(254)).toBeCloseTo(10, 4)
    })
  })

  describe('cmToInches', () => {
    it('converts 2.54 cm to 1 inch', () => {
      expect(cmToInches(2.54)).toBeCloseTo(1, 4)
    })

    it('converts 0 cm to 0 inches', () => {
      expect(cmToInches(0)).toBe(0)
    })

    it('converts 25.4 cm to 10 inches', () => {
      expect(cmToInches(25.4)).toBeCloseTo(10, 4)
    })
  })

  describe('Round-trip conversions', () => {
    it('inches -> mm -> inches maintains value', () => {
      const original = 12.5
      const mm = inchesToMm(original)
      const back = mmToInches(mm)
      expect(back).toBeCloseTo(original, 4)
    })

    it('inches -> cm -> inches maintains value', () => {
      const original = 12.5
      const cm = inchesToCm(original)
      const back = cmToInches(cm)
      expect(back).toBeCloseTo(original, 4)
    })
  })
})

describe('formatMeasurement', () => {
  it('formats imperial measurements with quotes', () => {
    expect(formatMeasurement(12.5, 'imperial', 2)).toBe('12.50"')
  })

  it('formats metric measurements in mm', () => {
    expect(formatMeasurement(1, 'metric', 2)).toBe('25.40 mm')
  })

  it('formats larger metric measurements', () => {
    expect(formatMeasurement(10, 'metric', 1)).toBe('254.0 mm')
  })

  it('defaults to imperial', () => {
    const result = formatMeasurement(5)
    expect(result).toContain('"')
  })

  it('respects precision parameter', () => {
    expect(formatMeasurement(12.123456, 'imperial', 3)).toBe('12.123"')
  })

  it('handles zero values', () => {
    expect(formatMeasurement(0, 'imperial')).toBe('0.00"')
    expect(formatMeasurement(0, 'metric')).toBe('0.00 mm')
  })
})

describe('parseMeasurement', () => {
  it('parses imperial measurements', () => {
    expect(parseMeasurement('12.5', 'imperial')).toBe(12.5)
  })

  it('parses imperial measurements with quotes', () => {
    expect(parseMeasurement('12.5"', 'imperial')).toBe(12.5)
  })

  it('parses metric measurements (mm assumed for large values)', () => {
    const result = parseMeasurement('254', 'metric')
    expect(result).toBeCloseTo(mmToInches(254), 4)
  })

  it('parses metric measurements (cm assumed for small values)', () => {
    const result = parseMeasurement('25.4', 'metric')
    expect(result).toBeCloseTo(cmToInches(25.4), 4)
  })

  it('handles measurements with mm unit', () => {
    const result = parseMeasurement('254 mm', 'metric')
    expect(result).toBeCloseTo(mmToInches(254), 4)
  })

  it('handles measurements with cm unit', () => {
    const result = parseMeasurement('25.4 cm', 'metric')
    expect(result).toBeCloseTo(cmToInches(25.4), 4)
  })

  it('throws error for invalid measurements', () => {
    expect(() => parseMeasurement('abc', 'imperial')).toThrow()
  })
})

describe('toDisplayValue', () => {
  it('converts inches to mm for metric display', () => {
    const result = toDisplayValue(1, 'metric', 2)
    expect(result).toBeCloseTo(25.4, 2)
  })

  it('keeps inches for imperial display', () => {
    const result = toDisplayValue(12.5, 'imperial', 2)
    expect(result).toBeCloseTo(12.5, 2)
  })

  it('respects precision parameter', () => {
    const result = toDisplayValue(12.123456, 'imperial', 3)
    expect(result).toBeCloseTo(12.123, 3)
  })
})

describe('toInternalValue', () => {
  it('converts mm to inches for metric input', () => {
    const result = toInternalValue(25.4, 'metric')
    expect(result).toBeCloseTo(1, 4)
  })

  it('keeps inches for imperial input', () => {
    const result = toInternalValue(12.5, 'imperial')
    expect(result).toBe(12.5)
  })

  it('handles zero values', () => {
    expect(toInternalValue(0, 'imperial')).toBe(0)
    expect(toInternalValue(0, 'metric')).toBe(0)
  })
})

describe('Utility Functions', () => {
  describe('getUnitLabel', () => {
    it('returns "inches" for imperial', () => {
      expect(getUnitLabel('imperial')).toBe('inches')
    })

    it('returns "mm" for metric', () => {
      expect(getUnitLabel('metric')).toBe('mm')
    })

    it('defaults to "inches"', () => {
      expect(getUnitLabel()).toBe('inches')
    })
  })

  describe('getUnitSymbol', () => {
    it('returns quote for imperial', () => {
      expect(getUnitSymbol('imperial')).toBe('"')
    })

    it('returns "mm" for metric', () => {
      expect(getUnitSymbol('metric')).toBe('mm')
    })

    it('defaults to quote', () => {
      expect(getUnitSymbol()).toBe('"')
    })
  })

  describe('getInputStep', () => {
    it('returns 0.125 for imperial (1/8 inch)', () => {
      expect(getInputStep('imperial')).toBe(0.125)
    })

    it('returns 1 for metric (1mm)', () => {
      expect(getInputStep('metric')).toBe(1)
    })

    it('defaults to 0.125', () => {
      expect(getInputStep()).toBe(0.125)
    })
  })
})

describe('Edge Cases', () => {
  it('handles negative values', () => {
    expect(inchesToMm(-5)).toBeCloseTo(-127, 2)
  })

  it('handles very large values', () => {
    expect(inchesToMm(1000)).toBeCloseTo(25400, 2)
  })

  it('handles very small values', () => {
    expect(inchesToMm(0.001)).toBeCloseTo(0.0254, 4)
  })

  it('handles decimal precision correctly', () => {
    const result = toDisplayValue(12.123456789, 'imperial', 2)
    expect(result).toBe(12.12)
  })
})
