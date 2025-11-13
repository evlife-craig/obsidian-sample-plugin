/**
 * Plugin settings and defaults
 */

import { FateChartOdds, OracleType, RollResult } from './types';

/**
 * Plugin settings interface
 */
export interface MythicGMESettings {
  // UI state
  collapsedSections: Record<string, boolean>;
  
  // Fate Chart defaults
  lastChaosFactor: number;
  lastOdds: FateChartOdds;
  
  // Roll history
  maxHistorySize: number;
  rollHistory: RollResult[];
  
  // Feature toggles
  showMagazineTables: boolean;
  autoInsertToNote: boolean;
  
  // Display settings
  popupDuration: number; // in milliseconds
  showCategoryTags: boolean;
  
  // Filters
  activeTypeFilters: OracleType[];
}

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: MythicGMESettings = {
  collapsedSections: {},
  lastChaosFactor: 5,
  lastOdds: FateChartOdds.FIFTY_FIFTY,
  maxHistorySize: 20,
  rollHistory: [],
  showMagazineTables: true,
  autoInsertToNote: false,
  popupDuration: 5000, // 5 seconds
  showCategoryTags: true,
  activeTypeFilters: [] // Empty = show all types
};
