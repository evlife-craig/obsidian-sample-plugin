# Requirements Document

## Introduction

The Custom Table Import feature enables users to create and load their own oracle tables into the Mythic GME plugin without writing TypeScript code. Users can define oracle tables in JSON format, place them in a designated folder within their vault, and have the plugin automatically discover, validate, and integrate these tables alongside the built-in oracle tables. This feature empowers users to extend the plugin with custom oracles from Mythic Magazine, homebrew content, or other RPG systems.

## Glossary

- **Plugin**: The Mythic GME Oracles plugin for Obsidian
- **User**: A person using the Plugin to access oracle tables
- **Custom Table**: An oracle table defined by the User in JSON format
- **Built-in Table**: An oracle table that ships with the Plugin in TypeScript
- **Table File**: A JSON file containing one or more Custom Table definitions
- **Tables Folder**: A designated folder in the vault where Table Files are stored
- **Vault**: An Obsidian vault where the Plugin is installed
- **Oracle View**: The sidebar panel that displays oracle tables
- **Table Registry**: The Plugin component that manages all available oracle tables
- **Validation Error**: An error message indicating that a Custom Table does not meet the required format

## Requirements

### Requirement 1

**User Story:** As a solo RPG player, I want to create custom oracle tables in JSON format, so that I can add new oracles without modifying the plugin code

#### Acceptance Criteria

1. WHEN the User creates a JSON file with valid oracle table data, THE Plugin SHALL recognize the file as a Table File
2. THE Plugin SHALL support JSON files containing a single Custom Table object
3. THE Plugin SHALL support JSON files containing an array of Custom Table objects
4. THE Plugin SHALL require each Custom Table to include the following fields: id, name, category, type, diceType, and entries
5. THE Plugin SHALL require each entry in a Custom Table to include a range array with two numbers and a result string

### Requirement 2

**User Story:** As a user, I want the plugin to automatically discover custom tables in a specific folder, so that I don't have to manually register each table

#### Acceptance Criteria

1. THE Plugin SHALL designate a folder path "mythic-gme-tables" in the vault root as the Tables Folder
2. WHEN the Plugin loads, THE Plugin SHALL scan the Tables Folder for JSON files
3. THE Plugin SHALL recursively scan subdirectories within the Tables Folder
4. WHEN a Table File is added to the Tables Folder, THE Plugin SHALL detect the new file within 5 seconds
5. WHEN a Table File is modified in the Tables Folder, THE Plugin SHALL reload the affected Custom Tables within 5 seconds
6. WHEN a Table File is deleted from the Tables Folder, THE Plugin SHALL remove the associated Custom Tables from the Table Registry within 5 seconds

### Requirement 3

**User Story:** As a user, I want the plugin to validate custom tables and show clear error messages, so that I can fix any formatting issues

#### Acceptance Criteria

1. WHEN the Plugin encounters a Table File with invalid JSON syntax, THE Plugin SHALL log a Validation Error with the file name and syntax error details
2. WHEN a Custom Table is missing a required field, THE Plugin SHALL log a Validation Error identifying the missing field and the table id or file name
3. WHEN a Custom Table has overlapping range values in entries, THE Plugin SHALL log a Validation Error identifying the conflicting ranges
4. WHEN a Custom Table has gaps in range coverage, THE Plugin SHALL log a Validation Error identifying the missing ranges
5. WHEN a Custom Table has an invalid diceType value, THE Plugin SHALL log a Validation Error listing the valid diceType options
6. THE Plugin SHALL display Validation Errors in a dedicated section of the Plugin settings tab
7. THE Plugin SHALL continue loading other valid Custom Tables when one Table File contains errors

### Requirement 4

**User Story:** As a user, I want custom tables to appear in the oracle view alongside built-in tables, so that I can use them in the same way

#### Acceptance Criteria

1. WHEN a Custom Table is successfully loaded, THE Plugin SHALL add the Custom Table to the Table Registry
2. THE Plugin SHALL display Custom Tables in the Oracle View grouped by their category field
3. THE Plugin SHALL render Custom Tables with the same UI components as Built-in Tables
4. WHEN the User clicks the roll button on a Custom Table, THE Plugin SHALL execute the roll using the same logic as Built-in Tables
5. THE Plugin SHALL include Custom Table results in the roll history with the same format as Built-in Table results
6. THE Plugin SHALL allow the User to insert Custom Table results into notes using the same mechanism as Built-in Tables

### Requirement 5

**User Story:** As a user, I want to organize custom tables into categories and subcategories, so that I can keep my oracle collection organized

#### Acceptance Criteria

1. THE Plugin SHALL support category names with forward slashes to indicate subcategories (e.g., "Mythic Magazine/Issue 1")
2. WHEN a Custom Table has a category with forward slashes, THE Plugin SHALL create nested collapsible sections in the Oracle View
3. THE Plugin SHALL display Custom Tables in alphabetical order within their category
4. THE Plugin SHALL persist the collapsed/expanded state of Custom Table categories across Plugin sessions
5. THE Plugin SHALL allow Custom Tables to use the same category names as Built-in Tables to group them together

### Requirement 6

**User Story:** As a user, I want to see which tables are custom and which are built-in, so that I can distinguish between plugin content and my own content

#### Acceptance Criteria

1. THE Plugin SHALL display a visual indicator (icon or badge) next to Custom Table names in the Oracle View
2. WHEN the User hovers over a Custom Table name, THE Plugin SHALL display a tooltip showing the source file path
3. THE Plugin SHALL include a "Source" field in the settings tab table list showing "Built-in" or the file path for each table
4. THE Plugin SHALL allow the User to filter the Oracle View to show only Built-in Tables or only Custom Tables

### Requirement 7

**User Story:** As a user, I want to reload custom tables without restarting Obsidian, so that I can quickly iterate on table definitions

#### Acceptance Criteria

1. THE Plugin SHALL provide a command "Reload Custom Tables" in the command palette
2. WHEN the User executes the "Reload Custom Tables" command, THE Plugin SHALL rescan the Tables Folder and reload all Table Files
3. THE Plugin SHALL display a notice showing the number of Custom Tables loaded and any Validation Errors
4. THE Plugin SHALL preserve the current Oracle View state (scroll position, expanded sections) after reloading
5. THE Plugin SHALL update the Oracle View to reflect added, modified, or removed Custom Tables after reloading

### Requirement 8

**User Story:** As a user, I want example JSON files and documentation, so that I can easily create my first custom table

#### Acceptance Criteria

1. THE Plugin SHALL provide a command "Create Example Custom Table" in the command palette
2. WHEN the User executes the "Create Example Custom Table" command, THE Plugin SHALL create the Tables Folder if it does not exist
3. WHEN the User executes the "Create Example Custom Table" command, THE Plugin SHALL create a file "example-table.json" in the Tables Folder with a complete, valid Custom Table example
4. THE Plugin SHALL include comments in the example JSON file explaining each field (using a separate README.md file in the Tables Folder)
5. THE Plugin SHALL create a "README.md" file in the Tables Folder with documentation on the JSON format and validation rules
