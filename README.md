# Mythic GME Oracles

A comprehensive Obsidian plugin that brings Mythic GME (Game Master Emulator) v2 oracles directly into your vault. Perfect for solo RPG players who want quick access to oracle tables without leaving their note-taking workflow.

## Features

-   **Sidebar Oracle Panel**: Access all oracle tables from a dedicated sidebar view
-   **Core Mythic GME v2 Tables**: Includes Fate Chart, Event Meaning (Action/Description), and Descriptor tables
-   **Fate Chart with Context**: Set Chaos Factor (1-9) and Odds for contextually appropriate yes/no answers
-   **Combined Rolls**: Roll Event Meaning (Action + Description) with a single click
-   **Roll History**: View recent rolls with timestamps and context
-   **One-Click Insert**: Insert roll results directly into your active note at cursor position
-   **Auto-Copy to Clipboard**: Results automatically copied for quick pasting anywhere
-   **Search & Filter**: Quickly find specific oracle tables
-   **Collapsible Sections**: Organize tables by category with persistent expand/collapse state
-   **Extensible**: Easy to add custom oracle tables from Mythic Magazine

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

### Adding Custom Oracle Tables

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

### 1.0.0 (Initial Release)

-   Core Mythic GME v2 oracle tables
-   Fate Chart with Chaos Factor and Odds
-   Event Meaning combined rolls
-   Roll history with insert and copy functionality
-   Search and filter capabilities
-   Collapsible table sections
-   Auto-copy to clipboard
