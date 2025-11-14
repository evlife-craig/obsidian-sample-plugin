/**
 * FileWatcher class for monitoring custom table JSON files
 * Watches a designated folder for file create/modify/delete events
 */

import { Vault, TAbstractFile, TFile, EventRef } from 'obsidian';
import { FileWatcherCallbacks } from '../types';

export class FileWatcher {
  private vault: Vault;
  private folderPath: string;
  private callbacks: FileWatcherCallbacks;
  private createEventRef: EventRef | null = null;
  private modifyEventRef: EventRef | null = null;
  private deleteEventRef: EventRef | null = null;

  constructor(vault: Vault, folderPath: string, callbacks: FileWatcherCallbacks) {
    this.vault = vault;
    this.folderPath = folderPath;
    this.callbacks = callbacks;
  }

  /**
   * Start watching for file changes in the designated folder
   */
  start(): void {
    // Register vault change event listeners
    this.createEventRef = this.vault.on('create', (file: TAbstractFile) => {
      this.onVaultChange(file, 'create');
    });

    this.modifyEventRef = this.vault.on('modify', (file: TAbstractFile) => {
      this.onVaultChange(file, 'modify');
    });

    this.deleteEventRef = this.vault.on('delete', (file: TAbstractFile) => {
      this.onVaultChange(file, 'delete');
    });
  }

  /**
   * Stop watching for file changes and cleanup
   */
  stop(): void {
    if (this.createEventRef) {
      this.vault.offref(this.createEventRef);
      this.createEventRef = null;
    }
    if (this.modifyEventRef) {
      this.vault.offref(this.modifyEventRef);
      this.modifyEventRef = null;
    }
    if (this.deleteEventRef) {
      this.vault.offref(this.deleteEventRef);
      this.deleteEventRef = null;
    }
  }

  /**
   * Handle vault change events and route to appropriate callback
   */
  private onVaultChange(file: TAbstractFile, eventType: 'create' | 'modify' | 'delete'): void {
    // Filter for JSON files only
    if (!this.isJsonFile(file)) {
      return;
    }

    // Check if file is in watched folder
    if (!this.isInWatchedFolder(file)) {
      return;
    }

    // Call appropriate callback based on event type
    const filePath = file.path;
    
    switch (eventType) {
      case 'create':
        this.callbacks.onCreate(filePath);
        break;
      case 'modify':
        this.callbacks.onModify(filePath);
        break;
      case 'delete':
        this.callbacks.onDelete(filePath);
        break;
    }
  }

  /**
   * Check if the file is a JSON file
   */
  private isJsonFile(file: TAbstractFile): boolean {
    return file instanceof TFile && file.extension === 'json';
  }

  /**
   * Check if the file is in the watched folder or its subdirectories
   */
  private isInWatchedFolder(file: TAbstractFile): boolean {
    const filePath = file.path;
    const normalizedFolderPath = this.folderPath.endsWith('/') 
      ? this.folderPath 
      : this.folderPath + '/';
    
    return filePath.startsWith(normalizedFolderPath) || filePath.startsWith(this.folderPath + '/');
  }
}
