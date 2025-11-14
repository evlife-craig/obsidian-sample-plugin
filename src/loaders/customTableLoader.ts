/**
 * CustomTableLoader - Manages loading and lifecycle of custom oracle tables
 * 
 * Responsibilities:
 * - Scans designated folder for JSON table files
 * - Validates and loads custom tables
 * - Monitors file changes via FileWatcher
 * - Manages validation errors
 * - Provides API for accessing loaded tables
 */

import { Vault, TFolder, TFile, Notice } from 'obsidian';
import { CustomOracleTable, TableFile, ValidationError } from '../types';
import { FileWatcher } from './fileWatcher';
import { TableValidator } from '../validation/tableValidator';
import { ValidationService } from '../validation/validationService';
import MythicGMEPlugin from '../../main';

export class CustomTableLoader {
  private plugin: MythicGMEPlugin;
  private vault: Vault;
  private fileWatcher: FileWatcher | null = null;
  private loadedFiles: Map<string, TableFile>;
  private validationService: ValidationService;
  private folderPath: string;

  constructor(plugin: MythicGMEPlugin) {
    this.plugin = plugin;
    this.vault = plugin.app.vault;
    this.loadedFiles = new Map();
    this.validationService = new ValidationService();
    this.folderPath = plugin.settings.customTablesFolder;
  }

  /**
   * Initialize the loader: create tables folder if needed and start file watcher
   */
  async initialize(): Promise<void> {
    try {
      console.log(`[CustomTableLoader] Initializing custom table loader for folder: ${this.folderPath}`);
      
      // Create tables folder if it doesn't exist
      try {
        const folder = this.vault.getAbstractFileByPath(this.folderPath);
        
        if (!folder) {
          await this.vault.createFolder(this.folderPath);
          console.log(`[CustomTableLoader] Created custom tables folder: ${this.folderPath}`);
        } else {
          console.log(`[CustomTableLoader] Custom tables folder exists: ${this.folderPath}`);
        }
      } catch (folderError: unknown) {
        // Handle folder creation errors
        const errorMessage = folderError instanceof Error ? folderError.message : String(folderError);
        
        // Silently ignore "Folder already exists" errors
        if (errorMessage && !errorMessage.includes('already exists')) {
          console.error(`[CustomTableLoader] Failed to create custom tables folder: ${this.folderPath}`, folderError);
          new Notice(`Failed to create custom tables folder: ${errorMessage}`);
          return;
        }
        // Folder already exists, continue silently
        console.log(`[CustomTableLoader] Custom tables folder already exists: ${this.folderPath}`);
      }

      // Start file watcher
      try {
        this.fileWatcher = new FileWatcher(this.vault, this.folderPath, {
          onCreate: this.handleFileCreated.bind(this),
          onModify: this.handleFileModified.bind(this),
          onDelete: this.handleFileDeleted.bind(this)
        });
        
        this.fileWatcher.start();
        console.log(`[CustomTableLoader] File watcher started for: ${this.folderPath}`);
      } catch (watcherError: unknown) {
        const errorMessage = watcherError instanceof Error ? watcherError.message : String(watcherError);
        console.error(`[CustomTableLoader] Failed to start file watcher:`, watcherError);
        new Notice(`Failed to start custom table file watcher: ${errorMessage}`);
      }
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[CustomTableLoader] Critical error during initialization:`, error);
      new Notice(`Failed to initialize custom table loader: ${errorMessage}`);
    }
  }

  /**
   * Scan folder and load all JSON files
   * @returns Array of successfully loaded custom tables
   */
  async loadAllTables(): Promise<CustomOracleTable[]> {
    const allTables: CustomOracleTable[] = [];
    let totalErrors = 0;
    
    try {
      // Get the tables folder
      const folder = this.vault.getAbstractFileByPath(this.folderPath);
      
      if (!folder || !(folder instanceof TFolder)) {
        console.warn(`[CustomTableLoader] Custom tables folder not found: ${this.folderPath}`);
        return allTables;
      }

      // Recursively get all JSON files in folder and subdirectories
      const jsonFiles = this.getJsonFilesRecursive(folder);
      
      if (jsonFiles.length === 0) {
        console.log(`[CustomTableLoader] No JSON files found in ${this.folderPath}`);
        return allTables;
      }

      console.log(`[CustomTableLoader] Found ${jsonFiles.length} JSON file(s) to load`);
      
      // Load each file, continuing even if one fails
      for (const file of jsonFiles) {
        try {
          const tableFile = await this.loadTableFile(file.path);
          
          if (tableFile.tables.length > 0) {
            allTables.push(...tableFile.tables);
          }
          
          if (tableFile.errors.length > 0) {
            totalErrors += tableFile.errors.length;
          }
        } catch (fileError: unknown) {
          // Catch any unexpected errors and continue with other files
          const errorMessage = fileError instanceof Error ? fileError.message : String(fileError);
          console.error(`[CustomTableLoader] Unexpected error loading file ${file.path}:`, fileError);
          
          const error: ValidationError = {
            file: file.path,
            message: `Unexpected error: ${errorMessage}`,
            severity: 'error'
          };
          this.validationService.addErrors(file.path, [error]);
          totalErrors++;
          
          // Continue loading other files
        }
      }

      // Log summary
      if (totalErrors > 0) {
        console.warn(`[CustomTableLoader] Loaded ${allTables.length} custom table(s) from ${jsonFiles.length} file(s) with ${totalErrors} error(s)`);
      } else {
        console.log(`[CustomTableLoader] Successfully loaded ${allTables.length} custom table(s) from ${jsonFiles.length} file(s)`);
      }
      
    } catch (error: unknown) {
      // Catch any critical errors in the loading process
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[CustomTableLoader] Critical error in loadAllTables:`, error);
      new Notice(`Failed to load custom tables: ${errorMessage}`);
    }
    
    return allTables;
  }

  /**
   * Load a single table file: read, parse, validate, and create CustomOracleTable objects
   * @param path - Path to the JSON file
   * @returns TableFile object with loaded tables and any errors
   */
  async loadTableFile(path: string): Promise<TableFile> {
    const tableFile: TableFile = {
      path,
      tables: [],
      errors: [],
      lastModified: Date.now()
    };

    try {
      // Read file content
      const file = this.vault.getAbstractFileByPath(path);
      
      if (!file || !(file instanceof TFile)) {
        const error: ValidationError = {
          file: path,
          message: 'File not found or is not a file',
          severity: 'error'
        };
        tableFile.errors.push(error);
        this.validationService.addErrors(path, [error]);
        this.loadedFiles.set(path, tableFile);
        console.error(`[CustomTableLoader] File not found: ${path}`);
        return tableFile;
      }

      // Read and parse JSON with error handling
      let content: string;
      try {
        content = await this.vault.read(file);
      } catch (readError: unknown) {
        const errorMessage = readError instanceof Error ? readError.message : String(readError);
        const error: ValidationError = {
          file: path,
          message: `Failed to read file: ${errorMessage}`,
          severity: 'error'
        };
        tableFile.errors.push(error);
        this.validationService.addErrors(path, [error]);
        this.loadedFiles.set(path, tableFile);
        console.error(`[CustomTableLoader] File read error in ${path}:`, readError);
        return tableFile;
      }

      // Parse JSON with detailed error handling
      let data: unknown;
      try {
        data = JSON.parse(content);
      } catch (parseError: unknown) {
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        const error: ValidationError = {
          file: path,
          message: `JSON syntax error: ${errorMessage}`,
          severity: 'error'
        };
        tableFile.errors.push(error);
        this.validationService.addErrors(path, [error]);
        this.loadedFiles.set(path, tableFile);
        console.error(`[CustomTableLoader] JSON parse error in ${path}:`, parseError);
        return tableFile;
      }

      // Handle both single table object and array of tables
      const tables = Array.isArray(data) ? data : [data];
      
      // Track loaded table IDs to detect duplicates within the same file
      const loadedIdsInFile = new Set<string>();
      
      // Validate and load each table
      for (let i = 0; i < tables.length; i++) {
        const tableData = tables[i];
        
        try {
          // Validate table structure and fields
          const validationResult = TableValidator.validate(tableData, path);
          
          if (validationResult.valid && validationResult.table) {
            const table = validationResult.table;
            
            // Check for duplicate IDs within the same file
            if (loadedIdsInFile.has(table.id)) {
              const error: ValidationError = {
                file: path,
                tableId: table.id,
                message: `Duplicate table ID '${table.id}' found within the same file`,
                severity: 'error'
              };
              tableFile.errors.push(error);
              console.warn(`[CustomTableLoader] Duplicate table ID in ${path}: ${table.id} (skipping duplicate)`);
              continue; // Skip this duplicate table
            }
            
            // Check for duplicate IDs against built-in tables
            if (this.plugin.engine && this.plugin.engine.getTable(table.id)) {
              const existingTable = this.plugin.engine.getTable(table.id);
              
              if (existingTable) {
                const isBuiltIn = !('source' in existingTable) || (existingTable as CustomOracleTable).source !== 'custom';
                
                if (isBuiltIn) {
                  const error: ValidationError = {
                    file: path,
                    tableId: table.id,
                    message: `Table ID '${table.id}' conflicts with a built-in table`,
                    severity: 'error'
                  };
                  tableFile.errors.push(error);
                  console.warn(`[CustomTableLoader] Table ID conflicts with built-in table in ${path}: ${table.id} (skipping)`);
                  continue; // Skip this table
                }
              }
            }
            
            // Check for duplicate IDs against already loaded custom tables from other files
            for (const [otherPath, otherFile] of this.loadedFiles.entries()) {
              if (otherPath !== path) {
                const duplicate = otherFile.tables.find(t => t.id === table.id);
                if (duplicate) {
                  const error: ValidationError = {
                    file: path,
                    tableId: table.id,
                    message: `Table ID '${table.id}' conflicts with table in ${otherPath}`,
                    severity: 'error'
                  };
                  tableFile.errors.push(error);
                  console.warn(`[CustomTableLoader] Duplicate table ID across files: ${table.id} in ${path} conflicts with ${otherPath} (skipping)`);
                  continue; // Skip this table
                }
              }
            }
            
            // Table is valid and unique, add it
            tableFile.tables.push(table);
            loadedIdsInFile.add(table.id);
            console.log(`[CustomTableLoader] Successfully loaded table '${table.id}' from ${path}`);
            
          } else {
            // Validation failed, errors already in validationResult
            tableFile.errors.push(...validationResult.errors);
            const tableId = tableData?.id || `table at index ${i}`;
            console.warn(`[CustomTableLoader] Validation failed for ${tableId} in ${path}:`, validationResult.errors);
          }
        } catch (tableError: unknown) {
          // Catch any unexpected errors during table processing
          const errorMessage = tableError instanceof Error ? tableError.message : String(tableError);
          const tableId = tableData?.id || `table at index ${i}`;
          const error: ValidationError = {
            file: path,
            tableId: tableId,
            message: `Unexpected error processing table: ${errorMessage}`,
            severity: 'error'
          };
          tableFile.errors.push(error);
          console.error(`[CustomTableLoader] Unexpected error processing table ${tableId} in ${path}:`, tableError);
          // Continue processing other tables
        }
      }

      // Store errors in validation service
      if (tableFile.errors.length > 0) {
        this.validationService.addErrors(path, tableFile.errors);
        console.warn(`[CustomTableLoader] ${tableFile.errors.length} validation error(s) in ${path}`);
      } else {
        // Clear any previous errors for this file
        this.validationService.clearErrors(path);
      }

      // Store loaded file
      this.loadedFiles.set(path, tableFile);
      
      // Log summary
      if (tableFile.tables.length > 0) {
        console.log(`[CustomTableLoader] Loaded ${tableFile.tables.length} table(s) from ${path}`);
      }
      
    } catch (error: unknown) {
      // Catch any unexpected top-level errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      const validationError: ValidationError = {
        file: path,
        message: `Critical error loading file: ${errorMessage}`,
        severity: 'error'
      };
      tableFile.errors.push(validationError);
      this.validationService.addErrors(path, [validationError]);
      this.loadedFiles.set(path, tableFile);
      console.error(`[CustomTableLoader] Critical error loading table file ${path}:`, error);
      
      // Show notice for critical errors only
      new Notice(`Failed to load custom table file: ${path.split('/').pop()}`);
    }

    return tableFile;
  }

  /**
   * Clear and reload all custom tables
   * @returns Array of successfully loaded custom tables
   */
  async reloadAllTables(): Promise<CustomOracleTable[]> {
    try {
      console.log(`[CustomTableLoader] Reloading all custom tables...`);
      
      // Clear existing custom tables from engine
      if (this.plugin.engine) {
        this.plugin.engine.clearCustomTables();
      }
      
      // Clear existing data
      this.loadedFiles.clear();
      this.validationService = new ValidationService();
      
      // Reload all tables
      const tables = await this.loadAllTables();
      
      // Add all loaded tables to engine
      if (this.plugin.engine) {
        for (const table of tables) {
          this.plugin.engine.addCustomTable(table);
        }
      }
      
      // Update plugin settings with validation errors
      this.plugin.settings.validationErrors = this.validationService.getAllErrors();
      await this.plugin.saveSettings();
      
      console.log(`[CustomTableLoader] Reload complete: ${tables.length} table(s) loaded`);
      
      return tables;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[CustomTableLoader] Critical error during reload:`, error);
      new Notice(`Failed to reload custom tables: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Get all loaded custom tables
   * @returns Array of all custom tables
   */
  getCustomTables(): CustomOracleTable[] {
    const allTables: CustomOracleTable[] = [];
    
    for (const tableFile of this.loadedFiles.values()) {
      allTables.push(...tableFile.tables);
    }
    
    return allTables;
  }

  /**
   * Get all validation errors
   * @returns Array of all validation errors
   */
  getValidationErrors(): ValidationError[] {
    return this.validationService.getAllErrors();
  }

  /**
   * Handle file created event - load new table file
   * @param path - Path to the created file
   */
  private async handleFileCreated(path: string): Promise<void> {
    try {
      console.log(`[CustomTableLoader] Custom table file created: ${path}`);
      
      const tableFile = await this.loadTableFile(path);
      
      if (tableFile.tables.length > 0) {
        // Add tables to engine
        for (const table of tableFile.tables) {
          if (this.plugin.engine) {
            this.plugin.engine.addCustomTable(table);
          }
        }
        
        console.log(`[CustomTableLoader] Loaded ${tableFile.tables.length} table(s) from new file: ${path}`);
        
        // Update settings with validation errors
        this.plugin.settings.validationErrors = this.validationService.getAllErrors();
        await this.plugin.saveSettings();
        
        // Refresh oracle view
        this.plugin.refreshOracleView();
      } else if (tableFile.errors.length > 0) {
        console.warn(`[CustomTableLoader] New file ${path} has errors, no tables loaded`);
        
        // Update settings with validation errors
        this.plugin.settings.validationErrors = this.validationService.getAllErrors();
        await this.plugin.saveSettings();
      }
    } catch (error: unknown) {
      console.error(`[CustomTableLoader] Error handling file creation for ${path}:`, error);
      new Notice(`Failed to load new custom table file: ${path.split('/').pop()}`);
    }
  }

  /**
   * Handle file modified event - reload modified table file
   * @param path - Path to the modified file
   */
  private async handleFileModified(path: string): Promise<void> {
    try {
      console.log(`[CustomTableLoader] Custom table file modified: ${path}`);
      
      // Remove old tables from this file from the engine
      const oldTableFile = this.loadedFiles.get(path);
      if (oldTableFile && this.plugin.engine) {
        for (const table of oldTableFile.tables) {
          this.plugin.engine.removeCustomTable(table.id);
        }
      }
      
      // Reload the file
      const tableFile = await this.loadTableFile(path);
      
      // Add new tables to engine
      if (tableFile.tables.length > 0 && this.plugin.engine) {
        for (const table of tableFile.tables) {
          this.plugin.engine.addCustomTable(table);
        }
        console.log(`[CustomTableLoader] Reloaded ${tableFile.tables.length} table(s) from modified file: ${path}`);
      } else if (tableFile.errors.length > 0) {
        console.warn(`[CustomTableLoader] Modified file ${path} has errors, no tables loaded`);
      }
      
      // Update settings with validation errors
      this.plugin.settings.validationErrors = this.validationService.getAllErrors();
      await this.plugin.saveSettings();
      
      // Refresh oracle view
      this.plugin.refreshOracleView();
      
    } catch (error: unknown) {
      console.error(`[CustomTableLoader] Error handling file modification for ${path}:`, error);
      new Notice(`Failed to reload custom table file: ${path.split('/').pop()}`);
    }
  }

  /**
   * Handle file deleted event - remove tables from deleted file
   * @param path - Path to the deleted file
   */
  private async handleFileDeleted(path: string): Promise<void> {
    try {
      console.log(`[CustomTableLoader] Custom table file deleted: ${path}`);
      
      // Get tables from deleted file
      const tableFile = this.loadedFiles.get(path);
      
      if (tableFile) {
        // Remove tables from engine
        if (this.plugin.engine) {
          for (const table of tableFile.tables) {
            this.plugin.engine.removeCustomTable(table.id);
          }
        }
        
        console.log(`[CustomTableLoader] Removed ${tableFile.tables.length} table(s) from deleted file: ${path}`);
        
        // Remove from loaded files
        this.loadedFiles.delete(path);
        
        // Clear validation errors for this file
        this.validationService.clearErrors(path);
        
        // Update settings with validation errors
        this.plugin.settings.validationErrors = this.validationService.getAllErrors();
        await this.plugin.saveSettings();
        
        // Refresh oracle view
        this.plugin.refreshOracleView();
      } else {
        console.warn(`[CustomTableLoader] Deleted file ${path} was not in loaded files`);
      }
    } catch (error: unknown) {
      console.error(`[CustomTableLoader] Error handling file deletion for ${path}:`, error);
      // Don't show notice for deletion errors as the file is already gone
    }
  }

  /**
   * Stop file watcher and cleanup
   */
  cleanup(): void {
    if (this.fileWatcher) {
      this.fileWatcher.stop();
      this.fileWatcher = null;
    }
  }

  /**
   * Recursively get all JSON files in a folder
   * @param folder - Folder to search
   * @returns Array of JSON files
   */
  private getJsonFilesRecursive(folder: TFolder): TFile[] {
    const jsonFiles: TFile[] = [];
    
    for (const child of folder.children) {
      if (child instanceof TFile && child.extension === 'json') {
        jsonFiles.push(child);
      } else if (child instanceof TFolder) {
        jsonFiles.push(...this.getJsonFilesRecursive(child));
      }
    }
    
    return jsonFiles;
  }
}
