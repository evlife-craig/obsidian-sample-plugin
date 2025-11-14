# Mythic GME Oracles

A comprehensive Obsidian plugin that brings Mythic GME (Game Master Emulator) v2 oracles directly into your vault. Perfect for solo RPG players who want quick access to oracle tables without leaving their note-taking workflow.

## Features

-   **Sidebar Oracle Panel**: Access all oracle tables from a dedicated sidebar view
-   **Core Mythic GME v2 Tables**: Includes Fate Chart, Event Meaning (Action/Description), and Descriptor tables
-   **Custom Table Import**: Load your own oracle tables from JSON files without writing code
-   **Automatic File Watching**: Custom tables update automatically when files change
-   **Fate Chart with Context**: Set Chaos Factor (1-9) and Odds for contextually appropriate yes/no answers
-   **Combined Rolls**: Roll Event Meaning (Action + Description) with a single click
-   **Roll History**: View recent rolls with timestamps and context
-   **One-Click Insert**: Insert roll results directly into your active note at cursor position
-   **Auto-Copy to Clipboard**: Results automatically copied for quick pasting anywhere
-   **Search & Filter**: Quickly find specific oracle tables
-   **Collapsible Sections**: Organize tables by category with persistent expand/collapse state
-   **Nested Categories**: Organize custom tables with subcategories using forward slashes
-   **Validation & Error Reporting**: Clear error messages help you fix table formatting issues

## Usage

### Opening the Oracle Panel

1. Click the dice icon (🎲) in the left ribbon, or
2. Use the command palette (Ctrl/Cmd + P) and search for "Open Mythic GME Oracles"

### Rolling on Oracle Tables

1. Browse or search for the oracle table you want to use
2. Click the roll button (🎲) next to the table name
3. The result appears in the roll history at the bottom of the sidebar
4. Results are automatically copied to your clipboard

### Using the Fate Chart

1. Expand the "Core Mythic GME v2" section
2. Find the Fate Chart table
3. Set your Chaos Factor (1-9) and select the Odds level
4. Click the roll button
5. The result shows Yes/No/Exceptional with the context used

### Rolling Event Meaning

1. Find the Event Meaning section
2. Click "Roll Event Meaning" to roll both Action and Description tables together
3. Get combined results like "Oppose - Technology" or "Create - Hope"

### Inserting Results into Notes

1. After rolling, find the result in the roll history
2. Click the insert button (📄) next to the result
3. The formatted result is inserted at your cursor position in the active note
4. If no note is open, you'll see a notification

### Managing Roll History

-   View up to 20 recent rolls with timestamps
-   Click "Clear" to remove all history
-   Each result shows the table name, outcome, and any relevant context

## Custom Oracle Tables

The plugin supports loading custom oracle tables from JSON files, allowing you to add tables from Mythic Magazine, homebrew content, or other RPG systems without writing code.

### Quick Start

1. Open the command palette (Ctrl/Cmd + P)
2. Run "Create Example Custom Table"
3. This creates a `mythic-gme-tables` folder with example files
4. Edit the example or create your own JSON files
5. Custom tables appear automatically in the oracle panel

### JSON Format

Custom tables are defined in JSON files placed in the `mythic-gme-tables` folder in your vault root.

#### Single Table Format

```json
{
    "id": "my-custom-oracle",
    "name": "My Custom Oracle",
    "category": "Custom",
    "type": "Standard",
    "diceType": "d100",
    "description": "Optional description",
    "entries": [
        { "range": [1, 10], "result": "First result" },
        { "range": [11, 20], "result": "Second result" },
        { "range": [21, 100], "result": "Third result" }
    ]
}
```

#### Multiple Tables Format

You can include multiple tables in a single JSON file:

```json
[
    {
        "id": "table-one",
        "name": "Table One",
        "category": "Custom",
        "type": "Standard",
        "diceType": "d20",
        "entries": [
            { "range": [1, 10], "result": "Result A" },
            { "range": [11, 20], "result": "Result B" }
        ]
    },
    {
        "id": "table-two",
        "name": "Table Two",
        "category": "Custom",
        "type": "Descriptor",
        "diceType": "d100",
        "entries": [
            { "range": [1, 50], "result": "Result X" },
            { "range": [51, 100], "result": "Result Y" }
        ]
    }
]
```

### Required Fields

Each custom table must include:

-   **id**: Unique identifier (string, use lowercase-with-hyphens)
-   **name**: Display name shown in the UI (string)
-   **category**: Category for grouping tables (string)
-   **type**: Oracle type - must be one of:
    -   `"Tool"` - Utility tables like Fate Chart
    -   `"Variation"` - Alternative versions of core tables
    -   `"Standard"` - General oracle tables
    -   `"Descriptor"` - Descriptor tables for generating details
-   **diceType**: Dice type - must be one of:
    -   `"d100"` - 1-100 range
    -   `"d20"` - 1-20 range
    -   `"d10"` - 1-10 range
    -   `"d6"` - 1-6 range
    -   `"custom"` - Custom range
-   **entries**: Array of range/result pairs (see below)

### Optional Fields

-   **description**: Description of the oracle (string)

### Entry Format

Each entry in the `entries` array must have:

-   **range**: Array of two numbers `[min, max]` (inclusive)
-   **result**: The result text (string)

Example:

```json
{ "range": [1, 5], "result": "Very unlikely outcome" }
```

### Validation Rules

The plugin validates custom tables and shows errors in the settings tab if:

1. **Missing Required Fields**: All required fields must be present
2. **Invalid Dice Type**: Must be one of the valid diceType values
3. **Range Coverage**: Ranges must cover the full dice range
    - d100: Must cover 1-100
    - d20: Must cover 1-20
    - d10: Must cover 1-10
    - d6: Must cover 1-6
4. **No Gaps**: Ranges must be continuous with no gaps
5. **No Overlaps**: Ranges cannot overlap
6. **Unique IDs**: Table IDs must be unique across all tables

### Nested Categories

Use forward slashes in category names to create subcategories:

```json
{
    "id": "issue-1-oracle",
    "name": "Issue 1 Oracle",
    "category": "Mythic Magazine/Issue 1",
    "type": "Standard",
    "diceType": "d100",
    "entries": [...]
}
```

This creates a nested structure in the oracle panel:

```
▼ Mythic Magazine
  ▼ Issue 1
    • Issue 1 Oracle 📄
```

You can nest as deep as needed:

```
"category": "Homebrew/Fantasy/Encounters/Urban"
```

### Custom Table Commands

The plugin provides three commands for managing custom tables:

#### Create Example Custom Table

-   **Command**: "Create Example Custom Table"
-   Creates the `mythic-gme-tables` folder if it doesn't exist
-   Generates `example-table.json` with a complete valid example
-   Creates `README.md` with format documentation
-   Perfect for getting started with custom tables

#### Reload Custom Tables

-   **Command**: "Reload Custom Tables"
-   Rescans the tables folder and reloads all JSON files
-   Useful after editing multiple files
-   Shows a notice with the count of loaded tables and any errors

#### Open Custom Tables Folder

-   **Command**: "Open Custom Tables Folder"
-   Opens the `mythic-gme-tables` folder in your file explorer
-   Creates the folder if it doesn't exist
-   Quick access to your custom table files

### Automatic File Watching

The plugin automatically detects changes to JSON files in the `mythic-gme-tables` folder:

-   **New Files**: Automatically loaded within 5 seconds
-   **Modified Files**: Automatically reloaded within 5 seconds
-   **Deleted Files**: Tables removed from the oracle panel within 5 seconds
-   **Subdirectories**: All subdirectories are monitored recursively

You can organize your tables in subdirectories:

```
mythic-gme-tables/
  ├── mythic-magazine/
  │   ├── issue-1.json
  │   └── issue-2.json
  ├── homebrew/
  │   └── my-tables.json
  └── example-table.json
```

### Visual Indicators

Custom tables are marked with a 📄 icon in the oracle panel to distinguish them from built-in tables. Hover over a custom table name to see its source file path in a tooltip.

### Filtering Tables

In the plugin settings, you can control which tables are visible:

-   **Show custom tables**: Toggle visibility of all custom tables
-   **Show built-in tables**: Toggle visibility of all built-in tables

This allows you to focus on just your custom content or just the core Mythic GME tables.

### Troubleshooting Custom Tables

#### Table Not Appearing

1. Check the plugin settings tab for validation errors
2. Ensure the JSON file is in the `mythic-gme-tables` folder or a subdirectory
3. Verify the file has a `.json` extension
4. Run "Reload Custom Tables" command to force a refresh

#### Validation Errors

The settings tab shows detailed validation errors grouped by file. Common issues:

**"Missing required field: [field]"**

-   Solution: Add the missing field to your table definition
-   All required fields: `id`, `name`, `category`, `type`, `diceType`, `entries`

**"Invalid diceType: [value]"**

-   Solution: Use one of the valid dice types: `"d100"`, `"d20"`, `"d10"`, `"d6"`, or `"custom"`
-   Check for typos (e.g., `"d50"` is invalid)

**"Range coverage must start at 1"**

-   Solution: Ensure your first entry starts at 1
-   Example: `{ "range": [1, 10], "result": "..." }`

**"Range coverage must end at [max]"**

-   Solution: Ensure your last entry ends at the maximum for your dice type
-   d100: Must end at 100
-   d20: Must end at 20
-   d10: Must end at 10
-   d6: Must end at 6

**"Gap in range coverage: [end] to [start]"**

-   Solution: Ensure ranges are continuous with no gaps
-   Example: If one entry ends at 10, the next must start at 11
-   Correct: `[1, 10]`, `[11, 20]`
-   Incorrect: `[1, 10]`, `[12, 20]` (gap at 11)

**"Overlapping ranges detected"**

-   Solution: Ensure no two entries cover the same numbers
-   Correct: `[1, 10]`, `[11, 20]`
-   Incorrect: `[1, 10]`, `[10, 20]` (10 appears in both)

**"JSON syntax error"**

-   Solution: Check for common JSON errors:
    -   Missing commas between entries
    -   Missing quotes around strings
    -   Trailing commas (not allowed in JSON)
    -   Mismatched brackets or braces
-   Use a JSON validator tool to check your file

**"Duplicate table ID"**

-   Solution: Ensure each table has a unique `id` field
-   IDs must be unique across all custom tables and built-in tables
-   Use descriptive, namespaced IDs: `"mythic-mag-issue-1-oracle"`

#### JSON Syntax Tips

-   Use double quotes `"` for strings, not single quotes `'`
-   Don't use trailing commas after the last item in arrays or objects
-   Ensure all brackets and braces are properly matched
-   Use a JSON formatter/validator to check your files before saving

### Example: Mythic Magazine Table

Here's a complete example of a custom table from Mythic Magazine:

```json
{
    "id": "mythic-mag-1-creature-abilities",
    "name": "Creature Abilities",
    "category": "Mythic Magazine/Issue 1",
    "type": "Standard",
    "diceType": "d100",
    "description": "Generate random creature abilities",
    "entries": [
        { "range": [1, 5], "result": "Amphibious" },
        { "range": [6, 10], "result": "Armored Hide" },
        { "range": [11, 15], "result": "Burrowing" },
        { "range": [16, 20], "result": "Camouflage" },
        { "range": [21, 25], "result": "Climbing" },
        { "range": [26, 30], "result": "Echolocation" },
        { "range": [31, 35], "result": "Flight" },
        { "range": [36, 40], "result": "Gills" },
        { "range": [41, 45], "result": "Keen Senses" },
        { "range": [46, 50], "result": "Multiple Limbs" },
        { "range": [51, 55], "result": "Natural Weapons" },
        { "range": [56, 60], "result": "Night Vision" },
        { "range": [61, 65], "result": "Pack Tactics" },
        { "range": [66, 70], "result": "Poison" },
        { "range": [71, 75], "result": "Regeneration" },
        { "range": [76, 80], "result": "Shapeshifting" },
        { "range": [81, 85], "result": "Speed" },
        { "range": [86, 90], "result": "Stealth" },
        { "range": [91, 95], "result": "Telepathy" },
        { "range": [96, 100], "result": "Venom" }
    ]
}
```

## Installation

### From Obsidian Community Plugins (Coming Soon)

1. Open Settings → Community Plugins
2. Search for "Mythic GME Oracles"
3. Click Install, then Enable

### Manual Installation

1. Download the latest release from the [Releases page](https://github.com/yourusername/obsidian-mythic-gme/releases)
2. Extract the files to your vault's plugins folder: `VaultFolder/.obsidian/plugins/mythic-gme-plugin/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### Building from Source

To build the plugin for use in your own vaults:

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to create a production build
4. Copy these three files to your vault's plugin folder:
    - `main.js`
    - `manifest.json`
    - `styles.css`
5. The destination should be: `YourVault/.obsidian/plugins/mythic-gme-plugin/`
6. Reload Obsidian and enable the plugin in Settings → Community Plugins

**Quick Copy Command (after building):**

```bash
# Replace /path/to/your/vault with your actual vault path
cp main.js manifest.json styles.css /path/to/your/vault/.obsidian/plugins/mythic-gme-plugin/
```

## Development

### Setup

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run setup-dev` to create a development vault with hot-reload
4. Run `npm run dev` to start compilation in watch mode
5. Open the `dev-vault` folder in Obsidian
6. Enable the plugin in Settings → Community Plugins

### Development Workflow

1. Make changes to TypeScript files in `src/`
2. The plugin automatically recompiles (watch mode)
3. Reload Obsidian (Ctrl/Cmd + R) to see changes
4. Test using the `Test Note.md` in the dev vault

### Project Structure

```
src/
  ├── oracleEngine.ts      # Core rolling logic and table registry
  ├── oracleView.ts        # Sidebar UI component
  ├── historyView.ts       # Roll history display
  ├── settings.ts          # Plugin settings interface
  ├── settingsTab.ts       # Settings UI
  ├── types.ts             # TypeScript interfaces and enums
  └── tables/
      ├── core/            # Mythic GME v2 core tables
      │   ├── fateChart.ts
      │   ├── eventMeaning.ts
      │   └── descriptors.ts
      ├── magazine/        # Mythic Magazine tables
      └── index.ts         # Table registry
```

### Build Commands

-   `npm run dev` - Start development build with watch mode
-   `npm run build` - Create production build
-   `npm run setup-dev` - Initialize development vault
-   `npm version patch/minor/major` - Bump version and update manifest

### Adding Built-in Oracle Tables (For Developers)

If you're developing the plugin and want to add built-in tables in TypeScript:

Create a new table file in `src/tables/`:

```typescript
import { OracleTable, DiceType, OracleType } from "../types";

export const myCustomTable: OracleTable = {
	id: "my-custom-table",
	name: "My Custom Oracle",
	category: "Custom Category",
	type: OracleType.STANDARD,
	diceType: DiceType.D100,
	entries: [
		{ range: [1, 10], result: "First Result" },
		{ range: [11, 20], result: "Second Result" },
		// ... more entries
	],
	description: "Optional description",
};
```

Then export it from `src/tables/index.ts` to make it available in the UI.

**Note**: For most users, it's easier to use the Custom Table Import feature (see above) rather than modifying the plugin source code.

## Requirements

-   Obsidian v0.15.0 or higher
-   Works on desktop and mobile

## Support

If you encounter issues or have feature requests, please [open an issue](https://github.com/yourusername/obsidian-mythic-gme/issues) on GitHub.

## License

MIT License - see LICENSE file for details

## Credits

Based on the Mythic Game Master Emulator v2 by Tana Pigeon.

Oracle tables and mechanics are from the Mythic GME system. This plugin is an unofficial tool for use with Mythic GME and is not affiliated with Word Mill Publishing.

## Changelog

### 1.1.0 (Custom Table Import)

-   **Custom Table Import**: Load oracle tables from JSON files without writing code
-   **Automatic File Watching**: Custom tables update automatically when files change
-   **Validation & Error Reporting**: Clear error messages for table formatting issues
-   **Nested Categories**: Organize tables with subcategories using forward slashes
-   **Visual Indicators**: Custom tables marked with 📄 icon and show source file on hover
-   **Table Filtering**: Toggle visibility of custom vs built-in tables
-   **New Commands**:
    -   Create Example Custom Table
    -   Reload Custom Tables
    -   Open Custom Tables Folder

### 1.0.0 (Initial Release)

-   Core Mythic GME v2 oracle tables
-   Fate Chart with Chaos Factor and Odds
-   Event Meaning combined rolls
-   Roll history with insert and copy functionality
-   Search and filter capabilities
-   Collapsible table sections
-   Auto-copy to clipboard
