# Implementation Plan

-   [x] 1. Extend type definitions for custom tables

    -   Add CustomOracleTable interface extending OracleTable with source, filePath, and loadedAt fields
    -   Add TableFile interface for tracking loaded files
    -   Add ValidationError and ValidationResult interfaces
    -   Extend MythicGMESettings interface with customTablesFolder, showCustomTables, showBuiltInTables, and validationErrors fields
    -   Add FileWatcherCallbacks interface
    -   _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

-   [x] 2. Implement TableValidator class

    -   Create src/validation/tableValidator.ts file
    -   Implement validate() method that orchestrates all validation checks
    -   Implement validateStructure() to check if data is object or array
    -   Implement validateRequiredFields() to check for id, name, category, type, diceType, entries
    -   Implement validateDiceType() to check against valid enum values
    -   Implement validateEntries() to check entry structure (range array and result string)
    -   Implement validateRangeCoverage() to ensure ranges cover full dice range without gaps
    -   Implement validateRangeOverlap() to detect overlapping ranges
    -   Return ValidationResult with valid flag, errors array, and parsed table if valid
    -   _Requirements: 3.2, 3.3, 3.4, 3.5_

-   [x] 3. Implement ValidationService class

    -   Create src/validation/validationService.ts file
    -   Implement addErrors() method to store errors by file path
    -   Implement clearErrors() method to remove errors for a specific file
    -   Implement getErrorsForFile() method to retrieve errors for a file
    -   Implement getAllErrors() method to get all validation errors
    -   Implement hasErrors() method to check if any errors exist
    -   Implement formatErrorsForDisplay() method to create user-friendly error messages
    -   _Requirements: 3.6, 3.7_

-   [x] 4. Implement FileWatcher class

    -   Create src/loaders/fileWatcher.ts file
    -   Implement constructor accepting vault, folderPath, and callbacks
    -   Implement start() method to register vault change event listener
    -   Implement stop() method to unregister event listener
    -   Implement onVaultChange() to detect file create/modify/delete events
    -   Implement isJsonFile() to filter for .json files only
    -   Implement isInWatchedFolder() to check if file is in tables folder or subdirectories
    -   Call appropriate callback (onCreate, onModify, onDelete) based on event type
    -   _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_

-   [x] 5. Implement CustomTableLoader class

    -   Create src/loaders/customTableLoader.ts file
    -   Implement constructor accepting plugin reference
    -   Implement initialize() method to create tables folder if needed and start file watcher
    -   Implement loadAllTables() method to scan folder and load all JSON files
    -   Implement loadTableFile() method to read, parse, validate, and create CustomOracleTable objects
    -   Implement reloadAllTables() method to clear and reload all custom tables
    -   Implement getCustomTables() method to return all loaded custom tables
    -   Implement getValidationErrors() method to return all validation errors
    -   Implement handleFileCreated() to load new table file
    -   Implement handleFileModified() to reload modified table file
    -   Implement handleFileDeleted() to remove tables from deleted file
    -   Implement cleanup() method to stop file watcher
    -   _Requirements: 1.1, 2.1, 2.2, 2.4, 2.5, 2.6, 3.7, 7.2_

-   [x] 6. Modify OracleEngine to support custom tables

    -   Add customTables Map to store custom tables separately from built-in tables
    -   Implement addCustomTable() method to add a custom table and rebuild categories
    -   Implement removeCustomTable() method to remove a custom table by ID and rebuild categories
    -   Implement clearCustomTables() method to remove all custom tables
    -   Modify getTable() to check both built-in and custom tables
    -   Modify getAllTables() to return combined array of built-in and custom tables
    -   Modify getCategories() to include custom tables in category structure
    -   Update rebuildCategories() to handle custom tables and maintain source tracking
    -   _Requirements: 4.1, 4.2, 5.1, 5.2, 5.3_

-   [x] 7. Integrate CustomTableLoader into plugin lifecycle

    -   Import CustomTableLoader in main.ts
    -   Add customTableLoader property to MythicGMEPlugin class
    -   Initialize CustomTableLoader in onload() after OracleEngine
    -   Call loadAllTables() and add each custom table to OracleEngine
    -   Store validation errors in plugin settings
    -   Call cleanup() in onunload() to stop file watching
    -   Update default settings to include new custom table settings
    -   _Requirements: 2.1, 2.2, 4.1_

-   [x] 8. Add custom table management commands

    -   Implement "Reload Custom Tables" command that calls reloadAllTables()
    -   Show notice with count of loaded tables and errors after reload
    -   Implement "Create Example Custom Table" command
    -   Create tables folder if it doesn't exist
    -   Write example-table.json with a complete valid example
    -   Write README.md with JSON format documentation
    -   Show notice confirming example creation
    -   Implement "Open Custom Tables Folder" command to reveal folder in file explorer
    -   _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4, 8.5_

-   [x] 9. Update OracleView to display custom table indicators

    -   Add visual indicator (📄 icon) next to custom table names in the UI
    -   Implement tooltip on hover showing source file path for custom tables
    -   Update renderCategories() to include custom table indicators
    -   Ensure custom tables use same UI components as built-in tables
    -   Preserve existing roll, insert, and history functionality for custom tables
    -   _Requirements: 4.3, 4.4, 4.5, 4.6, 6.1, 6.2_

-   [x] 10. Add custom tables section to settings tab

    -   Add "Custom Tables" section to settings tab UI
    -   Add text input for customTablesFolder setting
    -   Add checkboxes for showCustomTables and showBuiltInTables
    -   Add "Reload Custom Tables" button
    -   Add "Create Example Table" button
    -   Display count of loaded custom and built-in tables
    -   Add validation errors section showing errors grouped by file
    -   Format errors with file name, table ID, and error message
    -   Update settings save/load to persist custom table settings
    -   _Requirements: 3.6, 6.3, 7.2, 7.3_

-   [x] 11. Implement table filtering by source

    -   Add filter controls to OracleView for built-in vs custom tables
    -   Implement filterBySource() method in OracleEngine
    -   Update renderCategories() to respect source filters
    -   Persist filter state in plugin settings
    -   Update UI to show/hide tables based on filter settings
    -   _Requirements: 6.4_

-   [x] 12. Add support for nested categories

    -   Parse category strings with forward slashes (e.g., "Mythic Magazine/Issue 1")
    -   Create nested collapsible sections in OracleView
    -   Implement recursive category rendering
    -   Persist collapsed/expanded state for nested categories
    -   Sort tables alphabetically within each category
    -   _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

-   [x] 13. Implement error handling and recovery

    -   Add try-catch blocks in loadTableFile() for JSON parse errors
    -   Add try-catch blocks for file read errors
    -   Log all errors to console with context
    -   Add errors to ValidationService for display in settings
    -   Continue loading other files when one file has errors
    -   Show user-friendly notices for critical errors only
    -   Handle duplicate table IDs by skipping the duplicate and logging error
    -   _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7_

-   [x] 14. Update documentation
    -   Update main README.md with custom table import feature
    -   Add section explaining JSON format and validation rules
    -   Add examples of single and multiple table files
    -   Document the three new commands
    -   Add troubleshooting section for common validation errors
    -   Document nested category syntax
    -   _Requirements: 8.5_
