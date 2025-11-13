/**
 * HistoryView - Sidebar panel for roll history
 */

import { ItemView, WorkspaceLeaf, MarkdownView, Notice } from 'obsidian';
import { RollResult } from './types';
import MythicGMEPlugin from '../main';

export const VIEW_TYPE_HISTORY = 'mythic-gme-history-view';

export class HistoryView extends ItemView {
  private plugin: MythicGMEPlugin;
  private containerContent: HTMLElement;

  constructor(leaf: WorkspaceLeaf, plugin: MythicGMEPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_HISTORY;
  }

  getDisplayText(): string {
    return 'Roll History';
  }

  getIcon(): string {
    return 'dice';
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('mythic-gme-history-view');

    // Create main content container
    this.containerContent = container.createDiv({ cls: 'history-content' });

    // Render history
    this.renderHistory();
  }

  async onClose(): Promise<void> {
    // Cleanup if needed
  }

  /**
   * Refresh the history display (called when new rolls are added)
   */
  refresh(): void {
    this.renderHistory();
  }

  /**
   * Render roll history section
   */
  private renderHistory(): void {
    this.containerContent.empty();

    // History header
    const historyHeader = this.containerContent.createDiv({ cls: 'history-header' });
    
    historyHeader.createSpan({ 
      text: 'Recent Rolls',
      cls: 'history-title'
    });

    // Clear button
    const clearButton = historyHeader.createEl('button', {
      text: 'Clear All',
      cls: 'history-clear-button'
    });

    clearButton.addEventListener('click', () => {
      this.handleClearHistory();
    });

    // History content
    const historyContent = this.containerContent.createDiv({ cls: 'history-list' });

    // Display rolls in reverse chronological order
    if (this.plugin.settings.rollHistory.length === 0) {
      const emptyMessage = historyContent.createDiv({ cls: 'history-empty' });
      emptyMessage.createSpan({ 
        text: 'No rolls yet. Roll some oracle tables to see them here!',
        cls: 'history-empty-text'
      });
    } else {
      this.plugin.settings.rollHistory.forEach(roll => {
        this.renderHistoryItem(historyContent, roll);
      });
    }
  }

  /**
   * Render a single roll history item
   */
  private renderHistoryItem(container: HTMLElement, roll: RollResult): void {
    const historyItem = container.createDiv({ cls: 'history-item' });

    // Item header with table name
    const itemHeader = historyItem.createDiv({ cls: 'history-item-header' });
    itemHeader.createSpan({ 
      text: roll.tableName,
      cls: 'history-item-table-name'
    });

    // Timestamp
    itemHeader.createSpan({ 
      text: this.getRelativeTime(roll.timestamp),
      cls: 'history-item-time'
    });

    // Result value
    const itemResult = historyItem.createDiv({ cls: 'history-item-result' });
    itemResult.createSpan({ 
      text: roll.result,
      cls: 'history-item-result-text'
    });

    // Show dice roll if available
    if (roll.diceRoll !== undefined) {
      itemResult.createSpan({ 
        text: ` (rolled ${roll.diceRoll})`,
        cls: 'history-item-dice'
      });
    }

    // Show Fate Chart parameters if available
    if (roll.params) {
      const paramsDiv = historyItem.createDiv({ cls: 'history-item-params' });
      paramsDiv.createSpan({ 
        text: `Chaos: ${roll.params.chaosFactor}, Odds: ${roll.params.odds}`,
        cls: 'history-item-params-text'
      });
    }

    // Action buttons container
    const actionsDiv = historyItem.createDiv({ cls: 'history-item-actions' });

    // Copy button
    const copyButton = actionsDiv.createEl('button', {
      text: '📋',
      cls: 'history-action-button history-copy-button',
      attr: { 'aria-label': 'Copy to clipboard' }
    });

    copyButton.addEventListener('click', () => {
      this.handleCopyToClipboard(roll, copyButton);
    });

    // Insert button
    const insertButton = actionsDiv.createEl('button', {
      text: '📝',
      cls: 'history-action-button history-insert-button',
      attr: { 'aria-label': 'Insert to note' }
    });

    insertButton.addEventListener('click', () => {
      this.handleInsertToNote(roll, insertButton);
    });
  }

  /**
   * Get relative time string from timestamp
   */
  private getRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 10) {
      return 'Just now';
    } else if (seconds < 60) {
      return `${seconds}s ago`;
    } else if (minutes < 60) {
      return minutes === 1 ? '1m ago' : `${minutes}m ago`;
    } else if (hours < 24) {
      return hours === 1 ? '1h ago' : `${hours}h ago`;
    } else {
      return days === 1 ? '1d ago' : `${days}d ago`;
    }
  }

  /**
   * Clear roll history
   */
  private handleClearHistory(): void {
    this.plugin.settings.rollHistory = [];
    this.plugin.saveSettings();
    this.renderHistory();
  }

  /**
   * Handle insert to note from history item
   */
  private handleInsertToNote(roll: RollResult, button: HTMLElement): void {
    // Find the most recently active markdown editor
    // We need to look beyond just the active leaf since clicking the sidebar button
    // makes the sidebar the active leaf
    const leaves = this.app.workspace.getLeavesOfType('markdown');
    
    if (leaves.length === 0) {
      new Notice('No active note open. Please open a note to insert results.');
      return;
    }

    // Get the most recent markdown leaf (usually the last one that was focused)
    const markdownLeaf = leaves[0];
    const activeView = markdownLeaf.view;
    
    if (!(activeView instanceof MarkdownView)) {
      new Notice('No active note open. Please open a note to insert results.');
      return;
    }

    // Get the editor
    const editor = activeView.editor;
    if (!editor) {
      new Notice('No editor available.');
      return;
    }

    // Format the result for insertion
    const formattedText = this.formatRollForInsertion(roll);

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

    // Show feedback
    this.showInsertFeedback(button);
  }

  /**
   * Handle copy to clipboard from history item
   */
  private async handleCopyToClipboard(roll: RollResult, button: HTMLElement): Promise<void> {
    // Format the result text
    const formattedText = this.formatRollForClipboard(roll);

    try {
      await this.copyToClipboard(formattedText);
      this.showCopyFeedback(button);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }

  /**
   * Format a roll result for insertion into a note
   */
  private formatRollForInsertion(roll: RollResult): string {
    // Check if this is a combined roll (Event Meaning)
    if (roll.tableId === 'combined-roll' && roll.result.includes(' / ')) {
      // Combined roll format
      const parts = roll.result.split(' / ');
      return `**${roll.tableName}**: ${parts.join(' / ')}\n`;
    }

    // Single roll format
    let formatted = `**${roll.tableName}**: ${roll.result}`;

    // Add Fate Chart context if available
    if (roll.params) {
      formatted += ` (Chaos: ${roll.params.chaosFactor}, Odds: ${roll.params.odds})`;
    }

    return formatted + '\n';
  }

  /**
   * Format a roll result for clipboard
   */
  private formatRollForClipboard(roll: RollResult): string {
    let formatted = `**${roll.tableName}**: ${roll.result}`;
    
    if (roll.diceRoll !== undefined) {
      formatted += ` (rolled ${roll.diceRoll})`;
    }

    if (roll.params) {
      formatted += ` | Chaos: ${roll.params.chaosFactor}, Odds: ${roll.params.odds}`;
    }

    return formatted + '\n';
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
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Try fallback on error
      try {
        this.copyToClipboardFallback(text);
      } catch (fallbackError) {
        console.error('Fallback clipboard copy also failed:', fallbackError);
        throw fallbackError;
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
   * Show brief visual feedback when copy succeeds
   */
  private showCopyFeedback(button: HTMLElement): void {
    const originalText = button.textContent;
    button.textContent = '✓';
    button.addClass('copy-success');

    setTimeout(() => {
      button.textContent = originalText;
      button.removeClass('copy-success');
    }, 1500);
  }

  /**
   * Show brief visual feedback when insert succeeds
   */
  private showInsertFeedback(button: HTMLElement): void {
    const originalText = button.textContent;
    button.textContent = '✓';
    button.addClass('insert-success');

    setTimeout(() => {
      button.textContent = originalText;
      button.removeClass('insert-success');
    }, 1500);
  }
}
