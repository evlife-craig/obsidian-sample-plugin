# Implementation Plan

-   [x] 1. Set up development environment with hot-reload vault

    -   Create dev-vault directory structure
    -   Set up symlink from dev-vault/.obsidian/plugins/mythic-gme-plugin to project root
    -   Create setup script (scripts/setup-dev-vault.js) to automate vault initialization
    -   Add Test Note.md to dev-vault for testing insertions
    -   Update package.json with setup-dev script
    -   _Requirements: Development Environment Setup_

-   [x] 2. Implement core data models and types

    -   [x] 2.1 Create types file with enums and interfaces

        -   Define DiceType enum (D100, D20, D10, D6, CUSTOM)
        -   Define OracleType enum (TOOL, VARIATION, STANDARD, DESCRIPTOR)
        -   Define FateChartOdds enum with correct odds levels
        -   Create OracleTableEntry, OracleTable, FateChartParams interfaces
        -   Create RollResult and CombinedRollResult interfaces
        -   Create TableCategory interface
        -   _Requirements: 6.1, 9.2, 9.3_

    -   [x] 2.2 Create plugin settings interface and defaults
        -   Define MythicGMESettings interface
        -   Create DEFAULT_SETTINGS constant
        -   _Requirements: 2.3, 9.5_

-   [x] 3. Implement OracleEngine core logic

    -   [x] 3.1 Create OracleEngine class structure

        -   Implement constructor with table registry initialization
        -   Implement getTable method for table lookup
        -   Implement getCategories method for organized table access
        -   Implement searchTables method with case-insensitive filtering
        -   Implement filterByType method for oracle type filtering
        -   _Requirements: 5.2, 5.3_

    -   [x] 3.2 Implement dice rolling logic

        -   Create rollDice method supporting D100, D20, D10, D6
        -   Implement roll method for single table rolls
        -   Implement rollCombined method for multiple table rolls
        -   _Requirements: 3.2, 3.4, 10.2_

    -   [x] 3.3 Implement result formatting
        -   Create formatResult method for single roll display
        -   Create formatCombinedResult method for combined rolls
        -   Format results with table name and value
        -   _Requirements: 4.2, 4.3, 10.3_

-   [x] 4. Create oracle table data

    -   [x] 4.1 Implement Fate Chart table and logic

        -   Create tables/core/fateChart.ts
        -   Define FATE_CHART lookup table with all odds/chaos combinations
        -   Implement rollFateChart function with proper threshold logic
        -   Export Fate Chart as OracleTable
        -   _Requirements: 6.1, 9.4_

    -   [x] 4.2 Implement Event Meaning tables

        -   Create tables/core/eventMeaning.ts
        -   Define Action table with 100 entries
        -   Define Description table with 100 entries
        -   Export both tables as OracleTable objects
        -   _Requirements: 6.2, 10.1_

    -   [x] 4.3 Implement Descriptor tables

        -   Create tables/core/descriptors.ts
        -   Define descriptor tables from Mythic GME v2
        -   Export as OracleTable objects
        -   _Requirements: 6.3_

    -   [x] 4.4 Create table index and registry
        -   Create tables/index.ts to export all tables
        -   Organize tables by category (Core Mythic GME v2)
        -   Create placeholder for magazine tables directory
        -   _Requirements: 6.5, 7.2_

-   [x] 5. Implement main plugin class

    -   [x] 5.1 Create MythicGMEPlugin class

        -   Extend Obsidian Plugin class
        -   Implement onload method with view registration
        -   Implement onunload method with cleanup
        -   Implement loadSettings and saveSettings methods
        -   _Requirements: 1.1, 1.2_

    -   [x] 5.2 Register commands and view
        -   Register "Open Mythic GME Oracles" command
        -   Register OracleView with workspace
        -   Add ribbon icon for quick access
        -   _Requirements: 1.4_

-   [x] 6. Implement OracleView sidebar panel

    -   [x] 6.1 Create OracleView class structure

        -   Extend ItemView class
        -   Implement getViewType, getDisplayText, getIcon methods
        -   Implement onOpen and onClose lifecycle methods
        -   Initialize OracleEngine instance
        -   _Requirements: 1.1, 1.2, 1.3_

    -   [x] 6.2 Implement search functionality

        -   Create search input element in view
        -   Implement handleSearch method with debouncing
        -   Filter visible tables based on search query
        -   Update UI to show/hide tables based on search
        -   _Requirements: 5.1, 5.2, 5.3, 5.5_

    -   [x] 6.3 Implement oracle type filtering

        -   Create filter button UI (Tool, Variation, Standard, Descriptor, All)
        -   Implement handleTypeFilter method
        -   Filter tables by selected types
        -   Persist active filters in settings
        -   _Requirements: Future Enhancement 8_

    -   [x] 6.4 Implement collapsible table sections

        -   Create renderCategories method
        -   Render category headers with expand/collapse icons
        -   Implement toggle functionality for sections
        -   Persist collapsed state in settings
        -   _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

    -   [x] 6.5 Implement table list rendering
        -   Render individual oracle tables within sections
        -   Add roll button next to each table
        -   Show table names and descriptions
        -   Apply search and filter results to visible tables
        -   _Requirements: 3.1, 5.4_

-   [x] 7. Implement Fate Chart special controls

    -   [x] 7.1 Create Fate Chart input controls

        -   Add Chaos Factor numeric input (1-9) with validation
        -   Add Odds dropdown with all FateChartOdds options
        -   Show controls only when Fate Chart section is visible
        -   _Requirements: 9.1, 9.2, 9.3_

    -   [x] 7.2 Implement Fate Chart rolling with parameters
        -   Capture chaos factor and odds values on roll
        -   Pass FateChartParams to OracleEngine.roll
        -   Display result with context (chaos/odds used)
        -   Persist last used values in settings
        -   _Requirements: 9.4, 9.5_

-   [x] 8. Implement Event Meaning combined roll

    -   [x] 8.1 Add combined roll button for Event Meaning

        -   Create special UI for Event Meaning section
        -   Add "Roll Event Meaning" button that triggers both tables
        -   _Requirements: 10.1_

    -   [x] 8.2 Implement combined roll logic
        -   Call rollCombined with Action and Description table IDs
        -   Format combined result showing both values
        -   Display in roll history as single combined entry
        -   _Requirements: 10.2, 10.3_

-   [x] 9. Implement roll history display

    -   [x] 9.1 Create roll history UI component

        -   Create container for recent rolls at bottom of sidebar
        -   Add "Clear" button for history
        -   Display rolls in reverse chronological order
        -   _Requirements: 4.4, 4.5_

    -   [x] 9.2 Implement roll result display

        -   Show table name and result prominently
        -   Display relative timestamp
        -   Show additional context (Fate Chart params, combined results)
        -   Format consistently across all roll types
        -   _Requirements: 4.1, 4.2, 4.3_

    -   [x] 9.3 Implement history management
        -   Add new rolls to history on roll
        -   Limit history to maxHistorySize setting
        -   Implement clear history functionality
        -   Persist history in settings
        -   _Requirements: 4.4, 4.5_

-   [x] 10. Implement clipboard functionality

    -   [x] 10.1 Add copy to clipboard on roll

        -   Automatically copy result to clipboard after each roll
        -   Use navigator.clipboard API with fallback
        -   Handle clipboard errors gracefully
        -   _Requirements: 3.5_

    -   [x] 10.2 Add copy buttons to roll history
        -   Add copy button to each history item
        -   Copy formatted result text on click
        -   Show brief confirmation feedback
        -   _Requirements: 3.5_

-   [x] 11. Implement insert to note functionality

    -   [x] 11.1 Add insert buttons to roll history

        -   Add insert button to each history item
        -   Check for active editor before enabling
        -   _Requirements: 8.1_

    -   [x] 11.2 Implement editor insertion logic

        -   Get active MarkdownView and editor
        -   Insert formatted result at cursor position
        -   Maintain cursor position after insertion
        -   Handle no active note with Notice
        -   _Requirements: 8.2, 8.3, 8.4, 8.5_

    -   [x] 11.3 Implement result formatting for insertion
        -   Format single rolls with table name and result
        -   Format combined rolls with both results
        -   Format Fate Chart with chaos/odds context
        -   Make format readable and consistent
        -   _Requirements: 8.3, 10.5_

-   [x] 12. Add styling and polish

    -   [x] 12.1 Create styles.css for plugin UI

        -   Style sidebar layout and spacing
        -   Style collapsible sections with icons
        -   Style roll buttons and controls
        -   Style roll history cards
        -   Style Fate Chart controls
        -   Ensure good contrast and readability
        -   _Requirements: 4.1_

    -   [x] 12.2 Add visual feedback for interactions
        -   Add hover states for buttons
        -   Add active states for filters
        -   Add loading states for rolls (if needed)
        -   Add success feedback for copy/insert actions
        -   _Requirements: 4.1_

-   [x] 13. Update plugin metadata

    -   [x] 13.1 Update manifest.json

        -   Change plugin ID to "mythic-gme-plugin"
        -   Update name to "Mythic GME Oracles"
        -   Update description
        -   Set appropriate version
        -   _Requirements: All_

    -   [x] 13.2 Update README.md
        -   Document plugin features
        -   Add usage instructions
        -   Add development setup instructions
        -   Include screenshots or examples
        -   _Requirements: All_
