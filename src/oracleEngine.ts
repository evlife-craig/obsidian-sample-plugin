/**
 * OracleEngine - Core business logic for oracle operations
 */

import {
  OracleTable,
  CustomOracleTable,
  TableCategory,
  OracleType,
  DiceType,
  RollResult,
  CombinedRollResult,
  FateChartParams
} from './types';

export class OracleEngine {
  private builtInTables: Map<string, OracleTable>;
  private customTables: Map<string, CustomOracleTable>;
  private categories: TableCategory[];

  constructor(tables: OracleTable[]) {
    // Initialize built-in table registry
    this.builtInTables = new Map();
    tables.forEach(table => {
      this.builtInTables.set(table.id, table);
    });

    // Initialize custom tables registry
    this.customTables = new Map();

    // Organize tables into categories
    this.rebuildCategories();
  }

  /**
   * Add a custom table to the engine
   */
  addCustomTable(table: CustomOracleTable): void {
    this.customTables.set(table.id, table);
    this.rebuildCategories();
  }

  /**
   * Remove a custom table by ID
   */
  removeCustomTable(tableId: string): void {
    this.customTables.delete(tableId);
    this.rebuildCategories();
  }

  /**
   * Clear all custom tables
   */
  clearCustomTables(): void {
    this.customTables.clear();
    this.rebuildCategories();
  }

  /**
   * Get all tables (built-in and custom combined)
   */
  getAllTables(): OracleTable[] {
    return [
      ...Array.from(this.builtInTables.values()),
      ...Array.from(this.customTables.values())
    ];
  }

  /**
   * Rebuild categories from all tables (built-in and custom)
   * Supports nested categories using "/" separator
   */
  private rebuildCategories(): void {
    const allTables = this.getAllTables();
    
    // Separate core, magazine, and custom tables
    const coreTables = allTables.filter(t => !t.magazineVolume && !('source' in t && (t as CustomOracleTable).source === 'custom'));
    const magazineTables = allTables.filter(t => t.magazineVolume && !('source' in t && (t as CustomOracleTable).source === 'custom'));
    const customTables = allTables.filter(t => 'source' in t && (t as CustomOracleTable).source === 'custom');

    // Build nested category structure
    const rootCategories: TableCategory[] = [];
    
    // Helper function to find or create a category in the tree
    const findOrCreateCategory = (
      categoryPath: string[], 
      tables: OracleTable[], 
      source: 'core' | 'magazine',
      parentCategories: TableCategory[]
    ): TableCategory => {
      const currentName = categoryPath[0];
      const categoryId = categoryPath.join('-').toLowerCase().replace(/\s+/g, '-');
      
      // Look for existing category at this level
      let category = parentCategories.find(c => c.name === currentName);
      
      if (!category) {
        // Create new category
        category = {
          id: categoryId,
          name: currentName,
          tables: [],
          source: source,
          collapsed: false,
          subcategories: [],
          path: categoryPath
        };
        parentCategories.push(category);
      }
      
      // If this is a leaf category, add tables
      if (categoryPath.length === 1) {
        category.tables.push(...tables);
      } else {
        // Recurse into subcategory
        const remainingPath = categoryPath.slice(1);
        if (!category.subcategories) {
          category.subcategories = [];
        }
        findOrCreateCategory(remainingPath, tables, source, category.subcategories);
      }
      
      return category;
    };

    // Process core tables (no nesting for built-in tables)
    coreTables.forEach(table => {
      findOrCreateCategory([table.category], [table], 'core', rootCategories);
    });

    // Process magazine tables
    if (magazineTables.length > 0) {
      findOrCreateCategory(['Magazine Tables'], magazineTables, 'magazine', rootCategories);
    }

    // Process custom tables (support nested categories with "/")
    customTables.forEach(table => {
      const categoryPath = table.category.split('/').map(s => s.trim());
      findOrCreateCategory(categoryPath, [table], 'core', rootCategories);
    });

    // Sort tables alphabetically within each category (recursively)
    const sortCategoryTables = (category: TableCategory) => {
      category.tables.sort((a, b) => a.name.localeCompare(b.name));
      if (category.subcategories) {
        category.subcategories.forEach(sortCategoryTables);
      }
    };
    
    rootCategories.forEach(sortCategoryTables);

    this.categories = rootCategories;
  }

  /**
   * Get a table by ID (checks both built-in and custom tables)
   */
  getTable(id: string): OracleTable | undefined {
    return this.builtInTables.get(id) || this.customTables.get(id);
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
    const allTables = this.getAllTables();
    
    if (!query || query.trim() === '') {
      return allTables;
    }

    const lowerQuery = query.toLowerCase();
    return allTables.filter(table =>
      table.name.toLowerCase().includes(lowerQuery) ||
      table.category.toLowerCase().includes(lowerQuery) ||
      (table.description && table.description.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Filter tables by oracle type
   */
  filterByType(types: OracleType[]): OracleTable[] {
    const allTables = this.getAllTables();
    
    if (!types || types.length === 0) {
      return allTables;
    }

    return allTables.filter(table =>
      types.includes(table.type)
    );
  }

  /**
   * Filter tables by source (built-in vs custom)
   */
  filterBySource(showBuiltIn: boolean, showCustom: boolean): OracleTable[] {
    const allTables: OracleTable[] = [];
    
    if (showBuiltIn) {
      allTables.push(...Array.from(this.builtInTables.values()));
    }
    
    if (showCustom) {
      allTables.push(...Array.from(this.customTables.values()));
    }
    
    return allTables;
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
