/**
 * TableValidator - Validates custom oracle table definitions
 * 
 * Performs comprehensive validation of JSON table data including:
 * - Structure validation (object/array format)
 * - Required field presence
 * - Dice type validation
 * - Entry format validation
 * - Range coverage validation
 * - Range overlap detection
 */

import { DiceType, OracleType, ValidationError, ValidationResult, CustomOracleTable } from '../types';

export class TableValidator {
  /**
   * Main validation method that orchestrates all validation checks
   * @param data - Raw JSON data to validate
   * @param filePath - Path to the source file for error reporting
   * @returns ValidationResult with valid flag, errors, and parsed table if valid
   */
  static validate(data: any, filePath: string): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate structure
    const structureErrors = this.validateStructure(data, filePath);
    errors.push(...structureErrors);
    
    if (structureErrors.length > 0) {
      return { valid: false, errors };
    }

    // Validate required fields
    const requiredFieldErrors = this.validateRequiredFields(data, filePath);
    errors.push(...requiredFieldErrors);

    // Validate dice type
    const diceTypeErrors = this.validateDiceType(data, filePath);
    errors.push(...diceTypeErrors);

    // Validate entries
    const entryErrors = this.validateEntries(data, filePath);
    errors.push(...entryErrors);

    // Only validate range coverage and overlap if entries are valid
    if (entryErrors.length === 0 && data.entries && data.entries.length > 0) {
      const rangeCoverageErrors = this.validateRangeCoverage(data, filePath);
      errors.push(...rangeCoverageErrors);

      const rangeOverlapErrors = this.validateRangeOverlap(data, filePath);
      errors.push(...rangeOverlapErrors);
    }

    // If no errors, create CustomOracleTable
    if (errors.length === 0) {
      const customTable: CustomOracleTable = {
        id: data.id,
        name: data.name,
        category: data.category,
        type: data.type as OracleType,
        diceType: data.diceType as DiceType,
        entries: data.entries,
        description: data.description,
        magazineVolume: data.magazineVolume,
        source: 'custom',
        filePath: filePath,
        loadedAt: Date.now()
      };

      return { valid: true, errors: [], table: customTable };
    }

    return { valid: false, errors };
  }

  /**
   * Validates that data is an object (not array, null, or primitive)
   * @param data - Data to validate
   * @param filePath - Source file path for error reporting
   * @returns Array of validation errors
   */
  private static validateStructure(data: any, filePath: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (data === null || data === undefined) {
      errors.push({
        file: filePath,
        message: 'Table data is null or undefined',
        severity: 'error'
      });
      return errors;
    }

    if (typeof data !== 'object') {
      errors.push({
        file: filePath,
        message: `Table data must be an object, got ${typeof data}`,
        severity: 'error'
      });
      return errors;
    }

    if (Array.isArray(data)) {
      errors.push({
        file: filePath,
        message: 'Table data must be an object, not an array. If you have multiple tables, each should be validated separately.',
        severity: 'error'
      });
      return errors;
    }

    return errors;
  }

  /**
   * Validates that all required fields are present and non-empty
   * @param table - Table object to validate
   * @param filePath - Source file path for error reporting
   * @returns Array of validation errors
   */
  private static validateRequiredFields(table: any, filePath: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const requiredFields = ['id', 'name', 'category', 'type', 'diceType', 'entries'];

    for (const field of requiredFields) {
      if (!(field in table) || table[field] === null || table[field] === undefined) {
        errors.push({
          file: filePath,
          tableId: table.id,
          field: field,
          message: `Missing required field: ${field}`,
          severity: 'error'
        });
      } else if (typeof table[field] === 'string' && table[field].trim() === '') {
        errors.push({
          file: filePath,
          tableId: table.id,
          field: field,
          message: `Required field '${field}' cannot be empty`,
          severity: 'error'
        });
      }
    }

    // Validate type field against OracleType enum
    if (table.type && typeof table.type === 'string') {
      const validTypes = Object.values(OracleType);
      if (!validTypes.includes(table.type)) {
        errors.push({
          file: filePath,
          tableId: table.id,
          field: 'type',
          message: `Invalid type '${table.type}'. Must be one of: ${validTypes.join(', ')}`,
          severity: 'error'
        });
      }
    }

    return errors;
  }

  /**
   * Validates that diceType is a valid enum value
   * @param table - Table object to validate
   * @param filePath - Source file path for error reporting
   * @returns Array of validation errors
   */
  private static validateDiceType(table: any, filePath: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!table.diceType) {
      return errors; // Already caught by validateRequiredFields
    }

    const validDiceTypes = Object.values(DiceType);
    if (!validDiceTypes.includes(table.diceType)) {
      errors.push({
        file: filePath,
        tableId: table.id,
        field: 'diceType',
        message: `Invalid diceType '${table.diceType}'. Must be one of: ${validDiceTypes.join(', ')}`,
        severity: 'error'
      });
    }

    return errors;
  }

  /**
   * Validates entry structure (range array and result string)
   * @param table - Table object to validate
   * @param filePath - Source file path for error reporting
   * @returns Array of validation errors
   */
  private static validateEntries(table: any, filePath: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!table.entries) {
      return errors; // Already caught by validateRequiredFields
    }

    if (!Array.isArray(table.entries)) {
      errors.push({
        file: filePath,
        tableId: table.id,
        field: 'entries',
        message: 'Entries must be an array',
        severity: 'error'
      });
      return errors;
    }

    if (table.entries.length === 0) {
      errors.push({
        file: filePath,
        tableId: table.id,
        field: 'entries',
        message: 'Entries array cannot be empty',
        severity: 'error'
      });
      return errors;
    }

    table.entries.forEach((entry: any, index: number) => {
      if (!entry || typeof entry !== 'object') {
        errors.push({
          file: filePath,
          tableId: table.id,
          field: 'entries',
          message: `Entry at index ${index} must be an object`,
          severity: 'error'
        });
        return;
      }

      // Validate range
      if (!entry.range) {
        errors.push({
          file: filePath,
          tableId: table.id,
          field: 'entries',
          message: `Entry at index ${index} is missing 'range' field`,
          severity: 'error'
        });
      } else if (!Array.isArray(entry.range)) {
        errors.push({
          file: filePath,
          tableId: table.id,
          field: 'entries',
          message: `Entry at index ${index} has invalid range: must be an array`,
          severity: 'error'
        });
      } else if (entry.range.length !== 2) {
        errors.push({
          file: filePath,
          tableId: table.id,
          field: 'entries',
          message: `Entry at index ${index} has invalid range: must have exactly 2 numbers [min, max]`,
          severity: 'error'
        });
      } else if (typeof entry.range[0] !== 'number' || typeof entry.range[1] !== 'number') {
        errors.push({
          file: filePath,
          tableId: table.id,
          field: 'entries',
          message: `Entry at index ${index} has invalid range: both values must be numbers`,
          severity: 'error'
        });
      } else if (entry.range[0] > entry.range[1]) {
        errors.push({
          file: filePath,
          tableId: table.id,
          field: 'entries',
          message: `Entry at index ${index} has invalid range: min (${entry.range[0]}) cannot be greater than max (${entry.range[1]})`,
          severity: 'error'
        });
      }

      // Validate result
      if (!('result' in entry)) {
        errors.push({
          file: filePath,
          tableId: table.id,
          field: 'entries',
          message: `Entry at index ${index} is missing 'result' field`,
          severity: 'error'
        });
      } else if (typeof entry.result !== 'string') {
        errors.push({
          file: filePath,
          tableId: table.id,
          field: 'entries',
          message: `Entry at index ${index} has invalid result: must be a string`,
          severity: 'error'
        });
      } else if (entry.result.trim() === '') {
        errors.push({
          file: filePath,
          tableId: table.id,
          field: 'entries',
          message: `Entry at index ${index} has empty result`,
          severity: 'error'
        });
      }
    });

    return errors;
  }

  /**
   * Validates that ranges cover the full dice range without gaps
   * @param table - Table object to validate
   * @param filePath - Source file path for error reporting
   * @returns Array of validation errors
   */
  private static validateRangeCoverage(table: any, filePath: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!table.entries || !Array.isArray(table.entries) || table.entries.length === 0) {
      return errors;
    }

    // Skip validation for custom dice type
    if (table.diceType === DiceType.CUSTOM) {
      return errors;
    }

    const maxRoll = this.getMaxRollForDiceType(table.diceType);
    if (maxRoll === null) {
      return errors; // Invalid dice type, already caught elsewhere
    }

    // Sort entries by range start
    const sortedEntries = [...table.entries].sort((a: any, b: any) => {
      if (!a.range || !b.range) return 0;
      return a.range[0] - b.range[0];
    });

    // Check if starts at 1
    if (sortedEntries[0].range[0] !== 1) {
      errors.push({
        file: filePath,
        tableId: table.id,
        field: 'entries',
        message: `Range coverage must start at 1, but starts at ${sortedEntries[0].range[0]}`,
        severity: 'error'
      });
    }

    // Check for gaps between ranges
    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const currentEnd = sortedEntries[i].range[1];
      const nextStart = sortedEntries[i + 1].range[0];

      if (nextStart !== currentEnd + 1) {
        errors.push({
          file: filePath,
          tableId: table.id,
          field: 'entries',
          message: `Gap in range coverage: range ends at ${currentEnd} but next range starts at ${nextStart}`,
          severity: 'error'
        });
      }
    }

    // Check if ends at max
    const lastEnd = sortedEntries[sortedEntries.length - 1].range[1];
    if (lastEnd !== maxRoll) {
      errors.push({
        file: filePath,
        tableId: table.id,
        field: 'entries',
        message: `Range coverage must end at ${maxRoll} for ${table.diceType}, but ends at ${lastEnd}`,
        severity: 'error'
      });
    }

    return errors;
  }

  /**
   * Validates that ranges do not overlap
   * @param table - Table object to validate
   * @param filePath - Source file path for error reporting
   * @returns Array of validation errors
   */
  private static validateRangeOverlap(table: any, filePath: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!table.entries || !Array.isArray(table.entries) || table.entries.length === 0) {
      return errors;
    }

    // Sort entries by range start
    const sortedEntries = [...table.entries].sort((a: any, b: any) => {
      if (!a.range || !b.range) return 0;
      return a.range[0] - b.range[0];
    });

    // Check for overlaps
    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const currentEntry = sortedEntries[i];
      const nextEntry = sortedEntries[i + 1];

      if (!currentEntry.range || !nextEntry.range) {
        continue; // Invalid entries, already caught elsewhere
      }

      const currentEnd = currentEntry.range[1];
      const nextStart = nextEntry.range[0];

      if (currentEnd >= nextStart) {
        errors.push({
          file: filePath,
          tableId: table.id,
          field: 'entries',
          message: `Overlapping ranges detected: [${currentEntry.range[0]}, ${currentEnd}] overlaps with [${nextStart}, ${nextEntry.range[1]}]`,
          severity: 'error'
        });
      }
    }

    return errors;
  }

  /**
   * Helper method to get the maximum roll value for a dice type
   * @param diceType - The dice type
   * @returns Maximum roll value or null if invalid
   */
  private static getMaxRollForDiceType(diceType: string): number | null {
    switch (diceType) {
      case DiceType.D100:
        return 100;
      case DiceType.D20:
        return 20;
      case DiceType.D10:
        return 10;
      case DiceType.D6:
        return 6;
      case DiceType.CUSTOM:
        return null; // Custom dice don't have a fixed max
      default:
        return null;
    }
  }
}
