/**
 * Oracle Tables Index
 * Central registry for all oracle tables in the plugin
 */

import { OracleTable } from '../types';

// Core Mythic GME v2 Tables
import { fateChartTable } from './core/fateChart';
import { actionTable, descriptionTable } from './core/eventMeaning';
import { characterDescriptorTable, objectDescriptorTable } from './core/descriptors';

// Magazine Tables
import { magazineLocationTable, magazineNPCMotivationTable } from './magazine/testTable';

/**
 * All oracle tables organized by category
 */
export const ALL_TABLES: OracleTable[] = [
  // Core Mythic GME v2
  fateChartTable,
  actionTable,
  descriptionTable,
  characterDescriptorTable,
  objectDescriptorTable,
  
  // Magazine tables
  magazineLocationTable,
  magazineNPCMotivationTable
];

/**
 * Get all core Mythic GME v2 tables
 */
export function getCoreTables(): OracleTable[] {
  return ALL_TABLES.filter(table => table.category === 'Core Mythic GME v2');
}

/**
 * Get all Mythic Magazine tables
 */
export function getMagazineTables(): OracleTable[] {
  return ALL_TABLES.filter(table => table.category.includes('Magazine'));
}

/**
 * Export individual tables for direct access
 */
export {
  fateChartTable,
  actionTable,
  descriptionTable,
  characterDescriptorTable,
  objectDescriptorTable,
  magazineLocationTable,
  magazineNPCMotivationTable
};

/**
 * Export the rollFateChart function for special Fate Chart handling
 */
export { rollFateChart } from './core/fateChart';
