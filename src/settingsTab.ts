/**
 * Settings Tab for Mythic GME Plugin
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import MythicGMEPlugin from '../main';
import { ALL_TABLES } from './tables/index';
import { ValidationError } from './types';

export class MythicGMESettingTab extends PluginSettingTab {
  plugin: MythicGMEPlugin;

  constructor(app: App, plugin: MythicGMEPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Mythic GME Settings' });

    // Display Settings Section
    containerEl.createEl('h3', { text: 'Display Settings' });

    new Setting(containerEl)
      .setName('Result Popup Duration')
      .setDesc('How long to display roll results (in seconds)')
      .addSlider(slider => slider
        .setLimits(1, 10, 0.5)
        .setValue(this.plugin.settings.popupDuration / 1000)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.popupDuration = value * 1000;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Show Category Tags')
      .setDesc('Display type tags (Tool, Variation, etc.) on oracle table names')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showCategoryTags)
        .onChange(async (value) => {
          this.plugin.settings.showCategoryTags = value;
          await this.plugin.saveSettings();
          // Refresh oracle view immediately
          this.plugin.refreshOracleView();
        }));

    // Content Settings Section
    containerEl.createEl('h3', { text: 'Content Settings' });

    new Setting(containerEl)
      .setName('Show Magazine Tables')
      .setDesc('Include tables from Mythic Magazine in the oracle list')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showMagazineTables)
        .onChange(async (value) => {
          this.plugin.settings.showMagazineTables = value;
          await this.plugin.saveSettings();
        }));

    // History Settings Section
    containerEl.createEl('h3', { text: 'History Settings' });

    new Setting(containerEl)
      .setName('Maximum History Size')
      .setDesc('Maximum number of rolls to keep in history')
      .addSlider(slider => slider
        .setLimits(10, 100, 5)
        .setValue(this.plugin.settings.maxHistorySize)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.maxHistorySize = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Clear Roll History')
      .setDesc('Remove all rolls from history')
      .addButton(button => button
        .setButtonText('Clear History')
        .setWarning()
        .onClick(async () => {
          this.plugin.settings.rollHistory = [];
          await this.plugin.saveSettings();
          this.plugin.refreshHistoryView();
          button.setButtonText('Cleared!');
          setTimeout(() => {
            button.setButtonText('Clear History');
          }, 2000);
        }));

    // Behavior Settings Section
    containerEl.createEl('h3', { text: 'Behavior Settings' });

    new Setting(containerEl)
      .setName('Auto-insert to Note')
      .setDesc('Automatically insert roll results into the active note (in addition to copying to clipboard)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoInsertToNote)
        .onChange(async (value) => {
          this.plugin.settings.autoInsertToNote = value;
          await this.plugin.saveSettings();
        }));

    // Custom Tables Section
    containerEl.createEl('h3', { text: 'Custom Tables' });

    new Setting(containerEl)
      .setName('Tables Folder')
      .setDesc('Folder path in your vault where custom table JSON files are stored')
      .addText(text => text
        .setPlaceholder('mythic-gme-tables')
        .setValue(this.plugin.settings.customTablesFolder)
        .onChange(async (value) => {
          this.plugin.settings.customTablesFolder = value || 'mythic-gme-tables';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Show Custom Tables')
      .setDesc('Display custom tables in the oracle view')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showCustomTables)
        .onChange(async (value) => {
          this.plugin.settings.showCustomTables = value;
          await this.plugin.saveSettings();
          this.plugin.refreshOracleView();
        }));

    new Setting(containerEl)
      .setName('Show Built-in Tables')
      .setDesc('Display built-in tables in the oracle view')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showBuiltInTables)
        .onChange(async (value) => {
          this.plugin.settings.showBuiltInTables = value;
          await this.plugin.saveSettings();
          this.plugin.refreshOracleView();
        }));

    // Custom table management buttons
    const buttonContainer = new Setting(containerEl)
      .setName('Table Management')
      .setDesc('Manage custom oracle tables');

    buttonContainer.addButton(button => button
      .setButtonText('Reload Custom Tables')
      .onClick(async () => {
        await this.plugin.reloadCustomTables();
        this.display(); // Refresh settings display to show updated counts/errors
      }));

    buttonContainer.addButton(button => button
      .setButtonText('Create Example Table')
      .onClick(async () => {
        await this.plugin.createExampleTable();
      }));

    // Display table counts
    const customTableCount = this.plugin.customTableLoader?.getCustomTables().length || 0;
    const builtInTableCount = this.getBuiltInTableCount();
    
    const countInfo = containerEl.createDiv({ cls: 'custom-tables-info' });
    countInfo.createEl('p', { 
      text: `Loaded Tables: ${customTableCount} custom, ${builtInTableCount} built-in`,
      cls: 'setting-item-description'
    });

    // Display validation errors if any
    const validationErrors = this.plugin.settings.validationErrors || [];
    if (validationErrors.length > 0) {
      const errorSection = containerEl.createDiv({ cls: 'custom-tables-errors' });
      errorSection.createEl('h4', { text: `⚠ Validation Errors (${validationErrors.length})` });
      
      // Group errors by file
      const errorsByFile = this.groupErrorsByFile(validationErrors);
      
      const errorContainer = errorSection.createDiv({ cls: 'validation-errors-container' });
      
      for (const [file, errors] of Object.entries(errorsByFile)) {
        const fileErrorDiv = errorContainer.createDiv({ cls: 'file-errors' });
        fileErrorDiv.createEl('strong', { text: `❌ ${file}` });
        
        const errorList = fileErrorDiv.createEl('ul', { cls: 'error-list' });
        errors.forEach(error => {
          const errorItem = errorList.createEl('li');
          let errorText = error.message;
          if (error.tableId) {
            errorText = `Table "${error.tableId}": ${errorText}`;
          }
          if (error.field) {
            errorText = `${errorText} (field: ${error.field})`;
          }
          errorItem.setText(errorText);
        });
      }
    }
  }

  /**
   * Get count of built-in tables
   */
  private getBuiltInTableCount(): number {
    return ALL_TABLES.length;
  }

  /**
   * Group validation errors by file
   */
  private groupErrorsByFile(errors: ValidationError[]): Record<string, ValidationError[]> {
    const grouped: Record<string, ValidationError[]> = {};
    
    errors.forEach(error => {
      const file = error.file || 'Unknown file';
      if (!grouped[file]) {
        grouped[file] = [];
      }
      grouped[file].push(error);
    });
    
    return grouped;
  }
}
