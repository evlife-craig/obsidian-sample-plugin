/**
 * Mythic GME Plugin for Obsidian
 * Main plugin class
 */

import { Plugin, Notice } from 'obsidian';
import { MythicGMESettings, DEFAULT_SETTINGS } from './src/settings';
import { OracleView, VIEW_TYPE_ORACLE } from './src/oracleView';
import { HistoryView, VIEW_TYPE_HISTORY } from './src/historyView';
import { MythicGMESettingTab } from './src/settingsTab';
import { CustomTableLoader } from './src/loaders/customTableLoader';

export default class MythicGMEPlugin extends Plugin {
  settings: MythicGMESettings;
  customTableLoader: CustomTableLoader;
  engine: any; // OracleEngine instance from OracleView

  async onload() {
    await this.loadSettings();

    // Initialize custom table loader
    this.customTableLoader = new CustomTableLoader(this);
    
    try {
      await this.customTableLoader.initialize();
      
      // Load all custom tables
      const customTables = await this.customTableLoader.loadAllTables();
      
      // Store validation errors in settings
      this.settings.validationErrors = this.customTableLoader.getValidationErrors();
      await this.saveSettings();
      
      const errorCount = this.settings.validationErrors.length;
      if (errorCount > 0) {
        console.log(`Loaded ${customTables.length} custom tables with ${errorCount} validation errors`);
      } else {
        console.log(`Loaded ${customTables.length} custom tables`);
      }
    } catch (error) {
      console.error('Failed to initialize custom table loader:', error);
      new Notice('Failed to initialize custom table loader. Check console for details.');
    }

    // Register the oracle view
    this.registerView(
      VIEW_TYPE_ORACLE,
      (leaf) => new OracleView(leaf, this)
    );

    // Register the history view
    this.registerView(
      VIEW_TYPE_HISTORY,
      (leaf) => new HistoryView(leaf, this)
    );

    // Register command to open oracle view
    this.addCommand({
      id: 'open-mythic-gme-oracles',
      name: 'Open Mythic GME Oracles',
      callback: () => {
        this.activateOracleView();
      }
    });

    // Register command to open history view
    this.addCommand({
      id: 'open-mythic-gme-history',
      name: 'Open Roll History',
      callback: () => {
        this.activateHistoryView();
      }
    });

    // Register custom table management commands
    this.addCommand({
      id: 'reload-custom-tables',
      name: 'Reload Custom Tables',
      callback: async () => {
        await this.reloadCustomTables();
      }
    });

    this.addCommand({
      id: 'create-example-table',
      name: 'Create Example Custom Table',
      callback: async () => {
        await this.createExampleTable();
      }
    });

    this.addCommand({
      id: 'open-tables-folder',
      name: 'Open Custom Tables Folder',
      callback: async () => {
        await this.openTablesFolder();
      }
    });

    // Add ribbon icon for quick access to oracles
    this.addRibbonIcon('telescope', 'Open Mythic GME Oracles', (_evt: MouseEvent) => {
      this.activateOracleView();
    });

    // Register settings tab
    this.addSettingTab(new MythicGMESettingTab(this.app, this));

    // Automatically open both views on startup
    this.app.workspace.onLayoutReady(() => {
      this.activateOracleView();
      this.activateHistoryView();
    });
  }

  async activateOracleView() {
    const { workspace } = this.app;

    let leaf = workspace.getLeavesOfType(VIEW_TYPE_ORACLE)[0];

    if (!leaf) {
      // Create new leaf in right sidebar
      const rightLeaf = workspace.getRightLeaf(false);
      if (rightLeaf) {
        await rightLeaf.setViewState({
          type: VIEW_TYPE_ORACLE,
          active: true
        });
        leaf = rightLeaf;
      }
    }

    // Reveal the leaf
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  async activateHistoryView() {
    const { workspace } = this.app;

    let leaf = workspace.getLeavesOfType(VIEW_TYPE_HISTORY)[0];

    if (!leaf) {
      // Create new leaf in right sidebar
      const rightLeaf = workspace.getRightLeaf(false);
      if (rightLeaf) {
        await rightLeaf.setViewState({
          type: VIEW_TYPE_HISTORY,
          active: true
        });
        leaf = rightLeaf;
      }
    }

    // Reveal the leaf
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  /**
   * Refresh the history view when new rolls are added
   */
  refreshHistoryView() {
    const { workspace } = this.app;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_HISTORY);
    
    leaves.forEach(leaf => {
      const view = leaf.view;
      if (view instanceof HistoryView) {
        view.refresh();
      }
    });
  }

  /**
   * Refresh the oracle view when settings change
   */
  refreshOracleView() {
    const { workspace } = this.app;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_ORACLE);
    
    leaves.forEach(leaf => {
      const view = leaf.view;
      if (view instanceof OracleView) {
        view.refresh();
      }
    });
  }

  /**
   * Reload all custom tables
   */
  async reloadCustomTables() {
    try {
      const customTables = await this.customTableLoader.reloadAllTables();
      const errors = this.customTableLoader.getValidationErrors();
      
      // Update settings with validation errors
      this.settings.validationErrors = errors;
      await this.saveSettings();
      
      // Refresh oracle view
      this.refreshOracleView();
      
      // Show notice with results
      const errorCount = errors.length;
      if (errorCount > 0) {
        new Notice(`Reloaded ${customTables.length} custom tables (${errorCount} errors)`);
      } else {
        new Notice(`Reloaded ${customTables.length} custom tables`);
      }
      
      console.log(`Reloaded ${customTables.length} custom tables with ${errorCount} errors`);
    } catch (error) {
      console.error('Failed to reload custom tables:', error);
      new Notice(`Failed to reload custom tables: ${error.message}`);
    }
  }

  /**
   * Create example custom table with documentation
   */
  async createExampleTable() {
    try {
      const folderPath = this.settings.customTablesFolder;
      
      // Create tables folder if it doesn't exist
      const folder = this.app.vault.getAbstractFileByPath(folderPath);
      if (!folder) {
        await this.app.vault.createFolder(folderPath);
      }
      
      // Create example-table.json
      const exampleTablePath = `${folderPath}/example-table.json`;
      const exampleTableContent = {
        id: "example-custom-oracle",
        name: "Example Custom Oracle",
        category: "Examples",
        type: "Standard",
        diceType: "d20",
        description: "This is an example custom oracle table",
        entries: [
          { range: [1, 5], result: "Very unlikely outcome" },
          { range: [6, 10], result: "Unlikely outcome" },
          { range: [11, 15], result: "Likely outcome" },
          { range: [16, 20], result: "Very likely outcome" }
        ]
      };
      
      await this.app.vault.create(
        exampleTablePath,
        JSON.stringify(exampleTableContent, null, 2)
      );
      
      // Create README.md
      const readmePath = `${folderPath}/README.md`;
      const readmeContent = `# Custom Oracle Tables

This folder contains custom oracle tables for the Mythic GME plugin.

## JSON Format

Each JSON file can contain either a single table object or an array of table objects.

### Required Fields

- \`id\`: Unique identifier (string, lowercase-with-hyphens)
- \`name\`: Display name (string)
- \`category\`: Category for grouping (string, use "/" for subcategories)
- \`type\`: Oracle type (must be: "Tool", "Variation", "Standard", or "Descriptor")
- \`diceType\`: Dice type (must be: "d100", "d20", "d10", "d6", or "custom")
- \`entries\`: Array of range/result pairs

### Optional Fields

- \`description\`: Description of the oracle (string)

### Entry Format

Each entry must have:
- \`range\`: Array of two numbers [min, max] (inclusive)
- \`result\`: The result text (string)

### Validation Rules

1. Ranges must not overlap
2. Ranges must cover the full dice range (e.g., 1-100 for d100)
3. Table IDs must be unique
4. All required fields must be present

### Example

See \`example-table.json\` for a complete example.

### Organizing Tables

Use forward slashes in category names to create subcategories:
- "Mythic Magazine/Issue 1"
- "Homebrew/Fantasy/Encounters"

### Troubleshooting

Check the plugin settings tab for validation errors if your tables don't appear.
`;
      
      await this.app.vault.create(readmePath, readmeContent);
      
      // Show success notice
      new Notice(`Example table created in ${folderPath}/`);
      console.log(`Created example table and README in ${folderPath}/`);
      
    } catch (error) {
      console.error('Failed to create example table:', error);
      new Notice(`Failed to create example table: ${error.message}`);
    }
  }

  /**
   * Open custom tables folder in file explorer
   */
  async openTablesFolder() {
    try {
      const folderPath = this.settings.customTablesFolder;
      
      // Create folder if it doesn't exist
      const folder = this.app.vault.getAbstractFileByPath(folderPath);
      if (!folder) {
        await this.app.vault.createFolder(folderPath);
      }
      
      // Reveal folder in file explorer
      const folderFile = this.app.vault.getAbstractFileByPath(folderPath);
      if (folderFile) {
        // @ts-ignore - showInFolder is not in the type definitions but exists
        this.app.showInFolder(folderFile.path);
      }
      
    } catch (error) {
      console.error('Failed to open tables folder:', error);
      new Notice(`Failed to open tables folder: ${error.message}`);
    }
  }

  onunload() {
    // Cleanup custom table loader
    if (this.customTableLoader) {
      this.customTableLoader.cleanup();
    }
    
    // Cleanup: detach all views
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_ORACLE);
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_HISTORY);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
