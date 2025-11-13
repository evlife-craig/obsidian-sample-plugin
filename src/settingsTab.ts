/**
 * Settings Tab for Mythic GME Plugin
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import MythicGMEPlugin from '../main';

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
  }
}
