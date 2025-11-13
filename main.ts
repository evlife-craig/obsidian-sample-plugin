/**
 * Mythic GME Plugin for Obsidian
 * Main plugin class
 */

import { Plugin } from 'obsidian';
import { MythicGMESettings, DEFAULT_SETTINGS } from './src/settings';
import { OracleView, VIEW_TYPE_ORACLE } from './src/oracleView';
import { HistoryView, VIEW_TYPE_HISTORY } from './src/historyView';
import { MythicGMESettingTab } from './src/settingsTab';

export default class MythicGMEPlugin extends Plugin {
  settings: MythicGMESettings;

  async onload() {
    await this.loadSettings();

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

  onunload() {
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
