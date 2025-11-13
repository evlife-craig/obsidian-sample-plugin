/**
 * OracleEngine - Core business logic for oracle operations
 */

import {
  OracleTable,
  TableCategory,
  OracleType,
  DiceType,
  RollResult,
  CombinedRollResult,
  FateChartParams
} from './types';

export class OracleEngine {
  private tableRegistry: Map<string, OracleTable>;
  private categories: TableCategory[];

  constructor(tables: OracleTable[]) {
    // Initialize table registry
    this.tableRegistry = new Map();
    tables.forEach(table => {
      this.tableRegistry.set(table.id, table);
    });

    // Organize tables into categories
    this.categories = this.organizeTables(tables);
  }

  /**
   * Organize tables into categories
   */
  private organizeTables(tables: OracleTable[]): TableCategory[] {
    const categoryMap = new Map<string, TableCategory>();

    // Separate core and magazine tables
    const coreTables = tables.filter(t => !t.magazineVolume);
    const magazineTables = tables.filter(t => t.magazineVolume);

    // Organize core tables by their category
    coreTables.forEach(table => {
      if (!categoryMap.has(table.category)) {
        categoryMap.set(table.category, {
          id: table.category.toLowerCase().replace(/\s+/g, '-'),
          name: table.category,
          tables: [],
          source: 'core',
          collapsed: false
        });
      }
      const category = categoryMap.get(table.category);
      if (category) {
        category.tables.push(table);
      }
    });

    // Create a single "Magazine Tables" category if there are any
    if (magazineTables.length > 0) {
      categoryMap.set('Magazine Tables', {
        id: 'magazine-tables',
        name: 'Magazine Tables',
        tables: magazineTables,
        source: 'magazine',
        collapsed: false
      });
    }

    return Array.from(categoryMap.values());
  }

  /**
   * Get a table by ID
   */
  getTable(id: string): OracleTable | undefined {
    return this.tableRegistry.get(id);
  }

  /**
   * Get all categories with their tables
   */
  getCategories(): TableCategory[] {
    return this.categories;
  }

  /**
   * Search tables by name (case-insensitive)
   */
  searchTables(query: string): OracleTable[] {
    if (!query || query.trim() === '') {
      return Array.from(this.tableRegistry.values());
    }

    const lowerQuery = query.toLowerCase();
    return Array.from(this.tableRegistry.values()).filter(table =>
      table.name.toLowerCase().includes(lowerQuery) ||
      table.category.toLowerCase().includes(lowerQuery) ||
      (table.description && table.description.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Filter tables by oracle type
   */
  filterByType(types: OracleType[]): OracleTable[] {
    if (!types || types.length === 0) {
      return Array.from(this.tableRegistry.values());
    }

    return Array.from(this.tableRegistry.values()).filter(table =>
      types.includes(table.type)
    );
  }

  /**
   * Roll a dice based on type
   */
  private rollDice(diceType: DiceType): number {
    switch (diceType) {
      case DiceType.D100:
        return Math.floor(Math.random() * 100) + 1;
      case DiceType.D20:
        return Math.floor(Math.random() * 20) + 1;
      case DiceType.D10:
        return Math.floor(Math.random() * 10) + 1;
      case DiceType.D6:
        return Math.floor(Math.random() * 6) + 1;
      case DiceType.CUSTOM:
        // For custom, we'll default to d100
        return Math.floor(Math.random() * 100) + 1;
      default:
        return Math.floor(Math.random() * 100) + 1;
    }
  }

  /**
   * Find the result for a given roll value in a table
   */
  private findResult(roll: number, entries: OracleTable['entries']): string {
    for (const entry of entries) {
      if (roll >= entry.range[0] && roll <= entry.range[1]) {
        return entry.result;
      }
    }
    // Fallback if no match found
    return 'No result found';
  }

  /**
   * Roll on a single oracle table
   */
  roll(tableId: string, params?: FateChartParams): RollResult {
    const table = this.getTable(tableId);
    if (!table) {
      throw new Error(`Table not found: ${tableId}`);
    }

    // Special handling for Fate Chart
    if (tableId === 'fate-chart' && params) {
      // Import and use the special Fate Chart rolling logic
      const { rollFateChart } = require('./tables/core/fateChart');
      return rollFateChart(params);
    }

    const diceRoll = this.rollDice(table.diceType);
    const result = this.findResult(diceRoll, table.entries);

    return {
      tableName: table.name,
      tableId: table.id,
      result,
      diceRoll,
      timestamp: Date.now(),
      params
    };
  }

  /**
   * Roll multiple tables together
   */
  rollCombined(tableIds: string[]): CombinedRollResult {
    const results: RollResult[] = [];
    
    for (const tableId of tableIds) {
      try {
        const result = this.roll(tableId);
        results.push(result);
      } catch (error) {
        console.error(`Failed to roll table ${tableId}:`, error);
      }
    }

    // Use the first table's name as base, or generic name
    const tableName = results.length > 0 
      ? results.map(r => r.tableName).join(' + ')
      : 'Combined Roll';

    return {
      tableName,
      results,
      timestamp: Date.now()
    };
  }

  /**
   * Format a single roll result for display
   */
  formatResult(result: RollResult): string {
    let formatted = `**${result.tableName}**: ${result.result}`;
    
    if (result.diceRoll !== undefined) {
      formatted += ` (rolled ${result.diceRoll})`;
    }

    if (result.params) {
      formatted += ` | Chaos: ${result.params.chaosFactor}, Odds: ${result.params.odds}`;
    }

    return formatted + '\n';
  }

  /**
   * Format a combined roll result for display
   */
  formatCombinedResult(result: CombinedRollResult): string {
    let formatted = `**${result.tableName}**: `;
    
    result.results.forEach((r, index) => {
      formatted += `${r.tableName}: ${r.result}`;
      if (index < result.results.length - 1) {
        formatted += ' / ';
      }
    });

    return formatted + '\n';
  }
}
