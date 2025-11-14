/**
 * OracleView - Sidebar panel for oracle tables
 */

import { ItemView, WorkspaceLeaf, MarkdownView } from 'obsidian';
import { OracleEngine } from './oracleEngine';
import { ALL_TABLES } from './tables/index';
import { OracleType, TableCategory, FateChartOdds, FateChartParams, OracleTable, RollResult, CombinedRollResult, CustomOracleTable } from './types';
import MythicGMEPlugin from '../main';

export const VIEW_TYPE_ORACLE = 'mythic-gme-oracle-view';

export class OracleView extends ItemView {
  private plugin: MythicGMEPlugin;
  private engine: OracleEngine;
  private searchQuery = '';
  private searchDebounceTimer: number | null = null;
  private containerContent: HTMLElement;

  constructor(leaf: WorkspaceLeaf, plugin: MythicGMEPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.engine = new OracleEngine(ALL_TABLES);
    
    // Set engine reference on plugin for custom table loader to use
    plugin.engine = this.engine;
    
    // Add custom tables to engine if loader is available
    if (plugin.customTableLoader) {
      const customTables = plugin.customTableLoader.getCustomTables();
      customTables.forEach(table => this.engine.addCustomTable(table));
    }
  }

  getViewType(): string {
    return VIEW_TYPE_ORACLE;
  }

  getDisplayText(): string {
    return 'Mythic GME Oracles';
  }

  getIcon(): string {
    return 'telescope';
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('mythic-gme-oracle-view');

    // Create main content container
    this.containerContent = container.createDiv({ cls: 'oracle-content' });

    // Render all UI components in order
    this.renderChaosFactorControl();
    this.renderPinnedFateChart();
    this.renderOraclesBanner();
    this.renderSearch();
    this.renderTypeFilters();
    this.renderSourceFilters();
    this.renderCategories();
  }

  async onClose(): Promise<void> {
    // Clear any pending debounce timers
    if (this.searchDebounceTimer !== null) {
      window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
  }

  /**
   * Refresh the view (called when settings change)
   */
  refresh(): void {
    // Rebuild engine with current custom tables
    this.engine = new OracleEngine(ALL_TABLES);
    
    if (this.plugin.customTableLoader) {
      const customTables = this.plugin.customTableLoader.getCustomTables();
      customTables.forEach(table => this.engine.addCustomTable(table));
    }
    
    this.renderCategories();
  }

  /**
   * Render global Chaos Factor control
   */
  private renderChaosFactorControl(): void {
    const chaosContainer = this.containerContent.createDiv({ cls: 'chaos-factor-container' });
    
    const chaosLabel = chaosContainer.createDiv({ cls: 'chaos-factor-label' });
    chaosLabel.createSpan({ text: 'Chaos Factor', cls: 'chaos-factor-title' });

    const chaosControl = chaosContainer.createDiv({ cls: 'chaos-factor-control' });
    
    // Decrease button
    const decreaseBtn = chaosControl.createEl('button', {
      text: '−',
      cls: 'chaos-factor-button chaos-factor-decrease'
    });

    // Current value display
    const valueDisplay = chaosControl.createDiv({ 
      text: this.plugin.settings.lastChaosFactor.toString(),
      cls: 'chaos-factor-value'
    });

    // Increase button
    const increaseBtn = chaosControl.createEl('button', {
      text: '+',
      cls: 'chaos-factor-button chaos-factor-increase'
    });

    // Update chaos factor function
    const updateChaosFactor = (newValue: number) => {
      // Clamp between 1 and 9
      newValue = Math.max(1, Math.min(9, newValue));
      this.plugin.settings.lastChaosFactor = newValue;
      this.plugin.saveSettings();
      valueDisplay.setText(newValue.toString());
      
      // Update button disabled states
      decreaseBtn.disabled = newValue <= 1;
      increaseBtn.disabled = newValue >= 9;
    };

    decreaseBtn.addEventListener('click', () => {
      updateChaosFactor(this.plugin.settings.lastChaosFactor - 1);
    });

    increaseBtn.addEventListener('click', () => {
      updateChaosFactor(this.plugin.settings.lastChaosFactor + 1);
    });
    
    // Set initial disabled states
    updateChaosFactor(this.plugin.settings.lastChaosFactor);
  }

  /**
   * Render search input
   */
  private renderSearch(): void {
    const searchContainer = this.containerContent.createDiv({ cls: 'oracle-search-container' });
    
    const searchWrapper = searchContainer.createDiv({ cls: 'oracle-search-wrapper' });
    
    const searchInput = searchWrapper.createEl('input', {
      type: 'text',
      placeholder: 'Search tables...',
      cls: 'oracle-search-input'
    });

    const clearButton = searchWrapper.createEl('button', {
      text: '×',
      cls: 'oracle-search-clear',
      attr: { 'aria-label': 'Clear search' }
    });

    // Show/hide clear button based on input
    const updateClearButton = () => {
      if (searchInput.value) {
        clearButton.style.display = 'block';
      } else {
        clearButton.style.display = 'none';
      }
    };

    searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      updateClearButton();
      this.handleSearch(target.value);
    });

    clearButton.addEventListener('click', () => {
      searchInput.value = '';
      updateClearButton();
      this.handleSearch('');
      searchInput.focus();
    });

    // Initial state
    updateClearButton();
  }

  /**
   * Handle search with debouncing
   */
  private handleSearch(query: string): void {
    // Clear existing timer
    if (this.searchDebounceTimer !== null) {
      window.clearTimeout(this.searchDebounceTimer);
    }

    // Set new timer for debounced search
    this.searchDebounceTimer = window.setTimeout(() => {
      this.searchQuery = query;
      this.renderCategories();
      this.searchDebounceTimer = null;
    }, 300);
  }

  /**
   * Render oracle type filter buttons
   */
  private renderTypeFilters(): void {
    // Find or create filter container
    let filterContainer = this.containerContent.querySelector('.oracle-filter-container') as HTMLElement;
    
    if (!filterContainer) {
      filterContainer = this.containerContent.createDiv({ cls: 'oracle-filter-container' });
    } else {
      filterContainer.empty();
    }
    
    // Check if type filters should be disabled (only custom tables shown)
    const typeFiltersDisabled = !this.plugin.settings.showBuiltInTables && this.plugin.settings.showCustomTables;
    
    // Add label with context
    const labelText = typeFiltersDisabled ? 'Type (Built-in only): ' : 'Type: ';
    filterContainer.createSpan({ text: labelText, cls: 'filter-label' });
    
    const filterTypes = [
      { type: null, label: 'All' },
      { type: OracleType.TOOL, label: 'Tool' },
      { type: OracleType.VARIATION, label: 'Variation' },
      { type: OracleType.STANDARD, label: 'Standard' },
      { type: OracleType.DESCRIPTOR, label: 'Descriptor' }
    ];

    filterTypes.forEach(({ type, label }) => {
      const button = filterContainer.createEl('button', {
        text: label,
        cls: 'oracle-filter-button'
      });

      // Check if this filter is active
      const isActive = type === null 
        ? this.plugin.settings.activeTypeFilters.length === 0
        : this.plugin.settings.activeTypeFilters.includes(type);

      if (isActive) {
        button.addClass('active');
      }

      // Disable button if only custom tables are shown
      if (typeFiltersDisabled) {
        button.addClass('disabled');
        button.disabled = true;
        button.setAttribute('title', 'Type filters only apply to built-in tables');
      } else {
        button.addEventListener('click', () => {
          this.handleTypeFilter(type);
        });
      }
    });
  }

  /**
   * Render source filter controls (built-in vs custom)
   */
  private renderSourceFilters(): void {
    // Find or create source filter container
    let sourceFilterContainer = this.containerContent.querySelector('.oracle-source-filter-container') as HTMLElement;
    
    if (!sourceFilterContainer) {
      sourceFilterContainer = this.containerContent.createDiv({ cls: 'oracle-source-filter-container' });
    } else {
      sourceFilterContainer.empty();
    }
    
    sourceFilterContainer.createSpan({ text: 'Source: ', cls: 'filter-label' });
    
    // Built-in tables button
    const builtInButton = sourceFilterContainer.createEl('button', {
      text: 'Built-in',
      cls: 'oracle-filter-button'
    });

    if (this.plugin.settings.showBuiltInTables) {
      builtInButton.addClass('active');
    }

    builtInButton.addEventListener('click', () => {
      this.handleSourceFilter('built-in');
    });

    // Custom tables button
    const customButton = sourceFilterContainer.createEl('button', {
      text: 'Custom',
      cls: 'oracle-filter-button'
    });

    if (this.plugin.settings.showCustomTables) {
      customButton.addClass('active');
    }

    customButton.addEventListener('click', () => {
      this.handleSourceFilter('custom');
    });
  }

  /**
   * Handle source filter toggle
   */
  private handleSourceFilter(source: 'built-in' | 'custom'): void {
    if (source === 'built-in') {
      this.plugin.settings.showBuiltInTables = !this.plugin.settings.showBuiltInTables;
    } else {
      this.plugin.settings.showCustomTables = !this.plugin.settings.showCustomTables;
    }

    // Save settings and re-render
    this.plugin.saveSettings();
    this.renderSourceFilters();
    this.renderTypeFilters(); // Re-render type filters to update disabled state
    this.renderCategories();
  }

  /**
   * Handle oracle type filtering
   */
  private handleTypeFilter(type: OracleType | null): void {
    if (type === null) {
      // "All" button - clear filters
      this.plugin.settings.activeTypeFilters = [];
    } else {
      // Toggle the specific type
      const index = this.plugin.settings.activeTypeFilters.indexOf(type);
      if (index > -1) {
        // Remove if already active
        this.plugin.settings.activeTypeFilters.splice(index, 1);
      } else {
        // Add if not active
        this.plugin.settings.activeTypeFilters.push(type);
      }
    }

    // Save settings and re-render
    this.plugin.saveSettings();
    this.renderTypeFilters();
    this.renderCategories();
  }

  /**
   * Render the pinned Fate Chart (called once during onOpen)
   */
  private renderPinnedFateChart(): void {
    const fateChartTable = this.engine.getTable('fate-chart');
    if (!fateChartTable) return;

    const fateChartContainer = this.containerContent.createDiv({ cls: 'fate-chart-pinned-container' });
    const tableContainer = fateChartContainer.createDiv({ cls: 'oracle-table-container fate-chart-container fate-chart-pinned' });
    
    const tableInfo = tableContainer.createDiv({ cls: 'oracle-table-info' });
    
    tableInfo.createSpan({ 
      cls: 'oracle-table-name',
      text: fateChartTable.name
    });

    if (fateChartTable.description) {
      tableInfo.createDiv({ 
        cls: 'oracle-table-description',
        text: fateChartTable.description
      });
    }

    this.renderFateChartControls(tableContainer, fateChartTable);
  }

  /**
   * Render the Oracles banner/header
   */
  private renderOraclesBanner(): void {
    const banner = this.containerContent.createDiv({ cls: 'oracles-banner' });
    banner.createSpan({ 
      text: 'Rollable Tables',
      cls: 'oracles-banner-text'
    });
  }

  /**
   * Render collapsible table categories
   */
  private renderCategories(): void {
    // Find or create categories container
    let categoriesContainer = this.containerContent.querySelector('.oracle-categories-container') as HTMLElement;
    
    if (!categoriesContainer) {
      categoriesContainer = this.containerContent.createDiv({ cls: 'oracle-categories-container' });
    } else {
      categoriesContainer.empty();
    }

    // Get categories from engine
    const categories = this.engine.getCategories();

    // Apply search and type filters
    const filteredCategories = this.getFilteredCategories(categories);

    // Render each category
    filteredCategories.forEach(category => {
      this.renderCategory(categoriesContainer, category);
    });
  }

  /**
   * Get filtered categories based on search and type filters (recursive for nested categories)
   */
  private getFilteredCategories(categories: TableCategory[]): TableCategory[] {
    const filterCategory = (category: TableCategory): TableCategory | null => {
      // Filter tables by search query
      let filteredTables = category.tables;

      if (this.searchQuery.trim() !== '') {
        const searchResults = this.engine.searchTables(this.searchQuery);
        const searchIds = new Set(searchResults.map(t => t.id));
        filteredTables = filteredTables.filter(t => searchIds.has(t.id));
      }

      // Filter by type
      if (this.plugin.settings.activeTypeFilters.length > 0) {
        filteredTables = filteredTables.filter(t => 
          this.plugin.settings.activeTypeFilters.includes(t.type)
        );
      }

      // Filter by source (built-in vs custom)
      filteredTables = filteredTables.filter(t => {
        const customTable = t as CustomOracleTable;
        const isCustom = customTable.source === 'custom';
        
        if (isCustom) {
          return this.plugin.settings.showCustomTables;
        } else {
          return this.plugin.settings.showBuiltInTables;
        }
      });

      // Recursively filter subcategories
      let filteredSubcategories: TableCategory[] = [];
      if (category.subcategories) {
        filteredSubcategories = category.subcategories
          .map(filterCategory)
          .filter((c): c is TableCategory => c !== null);
      }

      // Only include category if it has tables or subcategories with content
      if (filteredTables.length > 0 || filteredSubcategories.length > 0) {
        return {
          ...category,
          tables: filteredTables,
          subcategories: filteredSubcategories
        };
      }

      return null;
    };

    return categories
      .map(filterCategory)
      .filter((c): c is TableCategory => c !== null);
  }

  /**
   * Render a single category section (supports nested categories)
   */
  private renderCategory(container: HTMLElement, category: TableCategory, depth: number = 0): void {
    const categorySection = container.createDiv({ cls: 'oracle-category' });
    
    // Add depth class for nested styling
    if (depth > 0) {
      categorySection.addClass(`oracle-category-depth-${depth}`);
    }

    // Get collapsed state from settings
    const isCollapsed = this.plugin.settings.collapsedSections[category.id] ?? false;

    // Category header
    const header = categorySection.createDiv({ cls: 'oracle-category-header' });
    
    // Add indentation for nested categories
    if (depth > 0) {
      header.style.paddingLeft = `${16 + (depth * 20)}px`;
    }
    
    header.createSpan({ 
      cls: 'oracle-category-icon',
      text: isCollapsed ? '▶' : '▼'
    });

    header.createSpan({ 
      cls: 'oracle-category-title',
      text: category.name
    });

    // Toggle collapse on header click
    header.addEventListener('click', () => {
      this.toggleCategory(category.id);
    });

    // Category content (tables and subcategories)
    if (!isCollapsed) {
      const content = categorySection.createDiv({ cls: 'oracle-category-content' });
      
      // Render tables in this category (already sorted by rebuildCategories)
      if (category.tables.length > 0) {
        this.renderTables(content, category.tables, category.name);
      }
      
      // Render subcategories recursively
      if (category.subcategories && category.subcategories.length > 0) {
        const subcategoriesContainer = content.createDiv({ cls: 'oracle-subcategories-container' });
        category.subcategories.forEach(subcategory => {
          this.renderCategory(subcategoriesContainer, subcategory, depth + 1);
        });
      }
    }
  }

  /**
   * Toggle category collapsed state
   */
  private toggleCategory(categoryId: string): void {
    const currentState = this.plugin.settings.collapsedSections[categoryId] ?? false;
    this.plugin.settings.collapsedSections[categoryId] = !currentState;
    this.plugin.saveSettings();
    this.renderCategories();
  }

  /**
   * Render tables within a category
   */
  private renderTables(container: HTMLElement, tables: TableCategory['tables'], categoryName: string): void {
    // Check if this category contains Event Meaning tables
    const hasActionTable = tables.some(t => t.id === 'event-meaning-action');
    const hasDescriptionTable = tables.some(t => t.id === 'event-meaning-description');
    
    // If both Event Meaning tables are present, render special combined UI
    if (hasActionTable && hasDescriptionTable) {
      this.renderEventMeaningSection(container, tables);
      // Don't return - continue to render other tables
    }

    tables.forEach(table => {
      // Skip Event Meaning tables if they were already rendered in the combined section
      if (table.id === 'event-meaning-action' || table.id === 'event-meaning-description') {
        if (hasActionTable && hasDescriptionTable) {
          return; // Skip these, they're in the combined section
        }
      }
      
      // Skip Fate Chart - it's pinned at the top
      if (table.id === 'fate-chart') {
        return;
      }

      // Regular table row layout
      const tableRow = container.createDiv({ cls: 'oracle-table-row' });

      const tableInfo = tableRow.createDiv({ cls: 'oracle-table-info' });
      
      // Table name with custom indicator
      const nameContainer = tableInfo.createDiv({ cls: 'oracle-table-name' });
      
      // Check if this is a custom table using type guard
      const customTable = table as CustomOracleTable;
      const isCustomTable = customTable.source === 'custom' && customTable.filePath;
      
      if (isCustomTable) {
        // Add custom table indicator icon with spacing
        const indicator = nameContainer.createSpan({ 
          cls: 'oracle-custom-indicator',
          text: '📄'
        });
        
        // Add tooltip with file path
        indicator.setAttribute('aria-label', `Custom table from: ${customTable.filePath}`);
        indicator.setAttribute('title', `Custom table from: ${customTable.filePath}`);
      }
      
      nameContainer.createSpan({ text: table.name });

      // Tags container (only for built-in tables, not custom tables)
      if (this.plugin.settings.showCategoryTags && !isCustomTable) {
        const tagsContainer = tableInfo.createDiv({ cls: 'oracle-tags-container' });
        
        // Type tag
        tagsContainer.createSpan({ 
          cls: 'oracle-category-tag',
          text: table.type
        });

        // Magazine volume tag if available
        if (table.magazineVolume) {
          tagsContainer.createSpan({ 
            cls: 'oracle-magazine-tag',
            text: table.magazineVolume
          });
        }
      }

      if (table.description) {
        tableInfo.createDiv({ 
          cls: 'oracle-table-description',
          text: table.description
        });
      }

      // Regular roll button
      const rollButton = tableRow.createEl('button', {
        text: '🎲',
        cls: 'oracle-roll-button'
      });

      rollButton.addEventListener('click', (e) => {
        this.handleRoll(table.id, e.currentTarget as HTMLElement);
      });
    });
  }

  /**
   * Render Event Meaning section with combined roll button
   */
  private renderEventMeaningSection(container: HTMLElement, tables: TableCategory['tables']): void {
    // Create special container for Event Meaning
    const eventMeaningContainer = container.createDiv({ cls: 'oracle-table-container event-meaning-container' });
    
    // Header section
    const headerSection = eventMeaningContainer.createDiv({ cls: 'event-meaning-header' });
    
    headerSection.createSpan({ 
      cls: 'oracle-table-name event-meaning-title',
      text: 'Event Meaning'
    });

    headerSection.createDiv({ 
      cls: 'oracle-table-description',
      text: 'Roll both Action and Description together'
    });

    // Combined roll button
    const combinedRollButton = eventMeaningContainer.createEl('button', {
      text: '🎲 Roll Event Meaning',
      cls: 'oracle-roll-button event-meaning-combined-button'
    });

    combinedRollButton.addEventListener('click', (e) => {
      this.handleEventMeaningRoll(e.currentTarget as HTMLElement);
    });

    // Individual tables section
    const individualTablesSection = eventMeaningContainer.createDiv({ cls: 'event-meaning-individual-tables' });
    
    individualTablesSection.createDiv({ 
      cls: 'event-meaning-separator',
      text: 'Or roll individually:'
    });

    // Render individual Action and Description tables
    tables.forEach(table => {
      if (table.id === 'event-meaning-action' || table.id === 'event-meaning-description') {
        const tableRow = individualTablesSection.createDiv({ cls: 'oracle-table-row event-meaning-individual-row' });

        const tableInfo = tableRow.createDiv({ cls: 'oracle-table-info' });
        
        // Table name with custom indicator
        const nameContainer = tableInfo.createSpan({ cls: 'oracle-table-name' });
        
        // Check if this is a custom table using type guard
        const customTable = table as CustomOracleTable;
        const isCustomTable = customTable.source === 'custom' && customTable.filePath;
        
        if (isCustomTable) {
          // Add custom table indicator icon with spacing
          const indicator = nameContainer.createSpan({ 
            cls: 'oracle-custom-indicator',
            text: '📄'
          });
          
          // Add tooltip with file path
          indicator.setAttribute('aria-label', `Custom table from: ${customTable.filePath}`);
          indicator.setAttribute('title', `Custom table from: ${customTable.filePath}`);
        }
        
        nameContainer.createSpan({ text: table.name });

        // Individual roll button
        const rollButton = tableRow.createEl('button', {
          text: '🎲',
          cls: 'oracle-roll-button oracle-roll-button-small'
        });

        rollButton.addEventListener('click', (e) => {
          this.handleRoll(table.id, e.currentTarget as HTMLElement);
        });
      }
    });
  }

  /**
   * Render Fate Chart specific controls
   */
  private renderFateChartControls(container: HTMLElement, table: OracleTable): void {
    const controlsContainer = container.createDiv({ cls: 'fate-chart-controls' });

    // Odds label
    controlsContainer.createSpan({ text: 'Odds:', cls: 'fate-chart-label' });
    
    // Odds buttons container
    const oddsButtonsContainer = controlsContainer.createDiv({ cls: 'fate-chart-odds-buttons' });
    
    // Add all odds options as buttons
    const oddsOptions = [
      { value: FateChartOdds.IMPOSSIBLE, label: 'Impossible' },
      { value: FateChartOdds.NEAR_IMPOSSIBLE, label: 'Near Impossible' },
      { value: FateChartOdds.VERY_UNLIKELY, label: 'Very Unlikely' },
      { value: FateChartOdds.UNLIKELY, label: 'Unlikely' },
      { value: FateChartOdds.FIFTY_FIFTY, label: '50/50' },
      { value: FateChartOdds.LIKELY, label: 'Likely' },
      { value: FateChartOdds.VERY_LIKELY, label: 'Very Likely' },
      { value: FateChartOdds.NEAR_CERTAIN, label: 'Near Certain' },
      { value: FateChartOdds.CERTAIN, label: 'Certain' }
    ];

    oddsOptions.forEach(({ value, label }) => {
      const button = oddsButtonsContainer.createEl('button', {
        text: label,
        cls: 'fate-chart-odds-button'
      });

      // Check if this is the selected odds
      if (value === this.plugin.settings.lastOdds) {
        button.addClass('active');
      }

      button.addEventListener('click', () => {
        this.handleOddsSelection(value, oddsButtonsContainer);
      });
    });

    // Roll button
    const rollButton = controlsContainer.createEl('button', {
      text: '🎲 Roll Fate',
      cls: 'oracle-roll-button fate-chart-roll-button'
    });

    rollButton.addEventListener('click', (e) => {
      this.handleFateChartRoll(e.currentTarget as HTMLElement);
    });
  }

  /**
   * Handle odds selection
   */
  private handleOddsSelection(odds: FateChartOdds, container: HTMLElement): void {
    // Update settings
    this.plugin.settings.lastOdds = odds;
    this.plugin.saveSettings();

    // Update button states
    const buttons = container.querySelectorAll('.fate-chart-odds-button');
    buttons.forEach(btn => {
      btn.removeClass('active');
    });

    // Find and activate the clicked button
    buttons.forEach(btn => {
      if (btn.textContent === this.getOddsLabel(odds)) {
        btn.addClass('active');
      }
    });
  }

  /**
   * Get display label for odds value
   */
  private getOddsLabel(odds: FateChartOdds): string {
    const labels: Record<FateChartOdds, string> = {
      [FateChartOdds.IMPOSSIBLE]: 'Impossible',
      [FateChartOdds.NEAR_IMPOSSIBLE]: 'Near Impossible',
      [FateChartOdds.VERY_UNLIKELY]: 'Very Unlikely',
      [FateChartOdds.UNLIKELY]: 'Unlikely',
      [FateChartOdds.FIFTY_FIFTY]: '50/50',
      [FateChartOdds.LIKELY]: 'Likely',
      [FateChartOdds.VERY_LIKELY]: 'Very Likely',
      [FateChartOdds.NEAR_CERTAIN]: 'Near Certain',
      [FateChartOdds.CERTAIN]: 'Certain'
    };
    return labels[odds];
  }

  /**
   * Handle a regular table roll
   */
  private handleRoll(tableId: string, button?: HTMLElement): void {
    try {
      // Add visual feedback to button if provided
      if (button) {
        this.showRollFeedback(button);
      }
      
      const result = this.engine.roll(tableId);
      this.displayRollResult(result);
    } catch (error) {
      console.error(`Failed to roll table ${tableId}:`, error);
    }
  }

  /**
   * Handle Fate Chart roll with parameters
   */
  private handleFateChartRoll(button?: HTMLElement): void {
    // Add visual feedback to button if provided
    if (button) {
      this.showRollFeedback(button);
    }
    
    // Get chaos factor from global setting
    const chaosFactor = this.plugin.settings.lastChaosFactor;

    // Get odds from settings (already saved when button clicked)
    const odds = this.plugin.settings.lastOdds;

    // Perform the roll
    const params: FateChartParams = { chaosFactor, odds };
    const result = this.engine.roll('fate-chart', params);

    // Display result with context
    this.displayRollResult(result);
  }

  /**
   * Handle Event Meaning combined roll
   */
  private handleEventMeaningRoll(button?: HTMLElement): void {
    // Add visual feedback to button if provided
    if (button) {
      this.showRollFeedback(button);
    }
    
    // Call rollCombined with Action and Description table IDs
    const result = this.engine.rollCombined([
      'event-meaning-action',
      'event-meaning-description'
    ]);

    // Display the combined result
    this.displayCombinedRollResult(result);
  }

  /**
   * Add a roll result to history and display latest roll
   */
  private addToHistory(result: RollResult): void {
    // Add to beginning of history array
    this.plugin.settings.rollHistory.unshift(result);

    // Limit history size
    if (this.plugin.settings.rollHistory.length > this.plugin.settings.maxHistorySize) {
      this.plugin.settings.rollHistory = this.plugin.settings.rollHistory.slice(0, this.plugin.settings.maxHistorySize);
    }

    // Save settings
    this.plugin.saveSettings();

    // Display the latest roll
    this.displayLatestRoll(result);

    // Refresh history view if it's open
    this.plugin.refreshHistoryView();
  }

  /**
   * Display a roll result and add to history
   */
  private displayRollResult(result: RollResult): void {
    // Add to history
    this.addToHistory(result);
    
    // Automatically copy to clipboard
    this.copyToClipboard(this.engine.formatResult(result));
    
    // Auto-insert to note if enabled
    if (this.plugin.settings.autoInsertToNote) {
      this.autoInsertToNote(result);
    }
  }

  /**
   * Display a combined roll result and add to history
   */
  private displayCombinedRollResult(result: CombinedRollResult): void {
    // Convert combined result to individual roll results and add to history
    // We'll store the combined result as a special roll result
    const combinedRollResult: RollResult = {
      tableName: result.tableName,
      tableId: 'combined-roll',
      result: result.results.map(r => `${r.tableName}: ${r.result}`).join(' / '),
      timestamp: result.timestamp,
      diceRoll: undefined
    };

    // Add to history
    this.addToHistory(combinedRollResult);
    
    // Automatically copy to clipboard
    this.copyToClipboard(this.engine.formatCombinedResult(result));
    
    // Auto-insert to note if enabled
    if (this.plugin.settings.autoInsertToNote) {
      this.autoInsertToNote(combinedRollResult);
    }
  }

  /**
   * Copy text to clipboard with fallback
   */
  private async copyToClipboard(text: string): Promise<void> {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        this.copyToClipboardFallback(text);
      }
      
      // Show toast notification
      this.showToast('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Try fallback on error
      try {
        this.copyToClipboardFallback(text);
        this.showToast('Copied to clipboard!');
      } catch (fallbackError) {
        console.error('Fallback clipboard copy also failed:', fallbackError);
      }
    }
  }

  /**
   * Fallback clipboard copy method using textarea
   */
  private copyToClipboardFallback(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textarea);
    }
  }

  /**
   * Display the roll result in a popup at the bottom
   */
  private displayLatestRoll(roll: RollResult): void {
    // Remove any existing popup first
    const existingPopup = this.containerEl.querySelector('.roll-result-popup');
    if (existingPopup) {
      existingPopup.remove();
    }
    
    // Create popup container in the view container
    const popup = this.containerEl.createDiv({ cls: 'roll-result-popup' });

    // Header with table name
    const header = popup.createDiv({ cls: 'roll-result-header' });
    header.createSpan({ 
      text: roll.tableName,
      cls: 'roll-result-table-name'
    });

    // Result text
    const resultText = popup.createSpan({ 
      text: roll.result,
      cls: 'roll-result-text'
    });

    // Show dice roll if available
    if (roll.diceRoll !== undefined) {
      resultText.createSpan({ 
        text: ` (${roll.diceRoll})`,
        cls: 'roll-result-dice'
      });
    }

    // Show Fate Chart parameters if available
    if (roll.params) {
      const paramsDiv = popup.createDiv({ cls: 'roll-result-params' });
      paramsDiv.createSpan({ 
        text: `Chaos: ${roll.params.chaosFactor}, Odds: ${roll.params.odds}`,
        cls: 'roll-result-params-text'
      });
    }

    // Auto-remove popup after duration
    const duration = this.plugin.settings.popupDuration;
    setTimeout(() => {
      popup.addClass('fade-out');
      setTimeout(() => {
        popup.remove();
      }, 300); // Wait for fade-out animation
    }, duration);
  }

  /**
   * Show brief visual feedback when a roll button is clicked
   */
  private showRollFeedback(button: HTMLElement): void {
    // Add a temporary class for animation
    button.addClass('rolling');
    
    // Remove the class after animation completes
    setTimeout(() => {
      button.removeClass('rolling');
    }, 600);
  }

  /**
   * Show a toast notification
   */
  private showToast(message: string): void {
    const toast = document.body.createDiv({ cls: 'mythic-toast', text: message });
    
    // Remove toast after animation completes
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * Auto-insert roll result to active note
   */
  private autoInsertToNote(roll: RollResult): void {
    // Find the most recently active markdown editor
    const leaves = this.app.workspace.getLeavesOfType('markdown');
    
    if (leaves.length === 0) {
      return; // No note open, silently skip
    }

    // Get the most recent markdown leaf
    const markdownLeaf = leaves[0];
    const activeView = markdownLeaf.view;
    
    if (!(activeView instanceof MarkdownView)) {
      return;
    }

    // Get the editor
    const editor = activeView.editor;
    if (!editor) {
      return;
    }

    // Format the result for insertion
    let formattedText: string;
    
    // Check if this is a combined roll (Event Meaning)
    if (roll.tableId === 'combined-roll' && roll.result.includes(' / ')) {
      const parts = roll.result.split(' / ');
      formattedText = `**${roll.tableName}**: ${parts.join(' / ')}\n`;
    } else {
      // Single roll format
      formattedText = `**${roll.tableName}**: ${roll.result}`;

      // Add Fate Chart context if available
      if (roll.params) {
        formattedText += ` (Chaos: ${roll.params.chaosFactor}, Odds: ${roll.params.odds})`;
      }

      formattedText += '\n';
    }

    // Get current cursor position
    const cursor = editor.getCursor();

    // Insert the text at cursor position
    editor.replaceRange(formattedText, cursor);

    // Move cursor to end of inserted text
    const lines = formattedText.split('\n');
    const newCursor = {
      line: cursor.line + lines.length - 1,
      ch: lines[lines.length - 1].length
    };
    editor.setCursor(newCursor);
  }

}
