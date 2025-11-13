/**
 * Core type definitions for the Mythic GME Plugin
 */

/**
 * Supported dice types for oracle tables
 */
export enum DiceType {
  D100 = 'd100',  // Percentile (1-100)
  D20 = 'd20',    // 1-20
  D10 = 'd10',    // 1-10
  D6 = 'd6',      // 1-6
  CUSTOM = 'custom' // Custom range
}

/**
 * Oracle table classification types
 */
export enum OracleType {
  TOOL = 'Tool',
  VARIATION = 'Variation',
  STANDARD = 'Standard',
  DESCRIPTOR = 'Descriptor'
}

/**
 * Fate Chart odds levels from Mythic GME v2
 */
export enum FateChartOdds {
  IMPOSSIBLE = 'Impossible',
  NEAR_IMPOSSIBLE = 'Near Impossible',
  VERY_UNLIKELY = 'Very Unlikely',
  UNLIKELY = 'Unlikely',
  FIFTY_FIFTY = '50/50',
  LIKELY = 'Likely',
  VERY_LIKELY = 'Very Likely',
  NEAR_CERTAIN = 'Near Certain',
  CERTAIN = 'Certain'
}

/**
 * Single entry in an oracle table with range and result
 */
export interface OracleTableEntry {
  range: [number, number]; // Inclusive range [min, max]
  result: string;
}

/**
 * Complete oracle table definition
 */
export interface OracleTable {
  id: string;
  name: string;
  category: string;
  type: OracleType;
  diceType: DiceType;
  entries: OracleTableEntry[];
  description?: string;
  magazineVolume?: string; // e.g., "Vol 1", "Vol 2 #3"
}

/**
 * Parameters for Fate Chart rolls
 */
export interface FateChartParams {
  chaosFactor: number; // 1-9
  odds: FateChartOdds;
}

/**
 * Result from a single oracle table roll
 */
export interface RollResult {
  tableName: string;
  tableId: string;
  result: string;
  diceRoll?: number;
  timestamp: number;
  params?: FateChartParams; // For Fate Chart rolls
}

/**
 * Result from rolling multiple tables together
 */
export interface CombinedRollResult {
  tableName: string;
  results: RollResult[];
  timestamp: number;
}

/**
 * Organizational category for grouping oracle tables
 */
export interface TableCategory {
  id: string;
  name: string;
  tables: OracleTable[];
  source: 'core' | 'magazine';
  collapsed: boolean;
}
