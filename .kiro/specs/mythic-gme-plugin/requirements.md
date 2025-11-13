# Requirements Document

## Introduction

This document defines the requirements for an Obsidian plugin that integrates Mythic GME (Game Master Emulator) v2 oracles and rollable tables from Mythic Magazine. The plugin provides a sidebar interface for accessing and rolling against various oracle tables to support solo role-playing game sessions.

## Glossary

- **Plugin**: The Obsidian Mythic GME Plugin being developed
- **Sidebar**: The right-side panel in Obsidian where the plugin interface will be displayed
- **Oracle Table**: A predefined table of outcomes used in Mythic GME for generating random results
- **Roll**: The action of generating a random result from an oracle table
- **Table Section**: A collapsible grouping of related oracle tables
- **Mythic GME v2**: The second version of the Mythic Game Master Emulator system
- **Mythic Magazine**: A publication containing additional oracle tables and content for Mythic GME
- **Fate Chart**: The core oracle table in Mythic GME used to answer yes/no questions with varying probabilities
- **Chaos Factor**: A numeric value (1-9) in Mythic GME that represents the level of chaos in the current scene
- **Odds**: The likelihood rating for a Fate Chart question (e.g., Impossible, Unlikely, 50/50, Likely, Certain)
- **Active Note**: The currently open and focused note document in Obsidian
- **Event Meaning**: A combination of Action and Description tables used to generate random scene events

## Requirements

### Requirement 1

**User Story:** As a solo RPG player, I want to access Mythic GME oracles from a sidebar panel, so that I can quickly reference and use them during my game sessions.

#### Acceptance Criteria

1. WHEN the user activates the Plugin, THE Plugin SHALL display a dedicated tab in the Sidebar
2. THE Plugin SHALL render the oracle interface within the Sidebar tab
3. THE Plugin SHALL maintain the Sidebar tab state across Obsidian sessions
4. WHEN the user closes the Sidebar tab, THE Plugin SHALL allow the user to reopen it through the Obsidian command palette

### Requirement 2

**User Story:** As a solo RPG player, I want to see oracle tables organized in collapsible sections, so that I can easily navigate between different types of oracles without clutter.

#### Acceptance Criteria

1. THE Plugin SHALL display oracle tables grouped into collapsible Table Sections
2. WHEN the user clicks on a Table Section header, THE Plugin SHALL toggle the visibility of tables within that section
3. THE Plugin SHALL persist the expanded or collapsed state of each Table Section across sessions
4. THE Plugin SHALL display a visual indicator showing whether each Table Section is expanded or collapsed
5. THE Plugin SHALL organize tables according to Mythic GME v2 categories and Mythic Magazine content

### Requirement 3

**User Story:** As a solo RPG player, I want to perform random rolls against oracle tables directly from the sidebar, so that I can generate results without leaving my note-taking workflow.

#### Acceptance Criteria

1. THE Plugin SHALL display a roll button or control next to each Oracle Table
2. WHEN the user clicks the roll control for an Oracle Table, THE Plugin SHALL generate a random result from that table
3. THE Plugin SHALL display the table result value to the user within the Sidebar
4. THE Plugin SHALL use appropriate randomization logic based on the Oracle Table structure (percentile dice, d10, d6, etc.)
5. WHEN a roll is performed, THE Plugin SHALL copy the result value to the system clipboard

### Requirement 4

**User Story:** As a solo RPG player, I want to see clear and readable oracle table results, so that I can quickly understand the outcome and continue my game session.

#### Acceptance Criteria

1. THE Plugin SHALL display roll results with sufficient contrast and readability
2. THE Plugin SHALL show the table name along with the result value
3. THE Plugin SHALL display results in a consistent format across all Oracle Tables
4. WHEN multiple rolls are performed, THE Plugin SHALL maintain a visible history of recent results
5. THE Plugin SHALL allow the user to clear the roll history

### Requirement 5

**User Story:** As a solo RPG player, I want to search for specific oracle tables, so that I can quickly find the table I need without manually browsing through sections.

#### Acceptance Criteria

1. THE Plugin SHALL provide a search input field in the Sidebar interface
2. WHEN the user types in the search field, THE Plugin SHALL filter the visible Oracle Tables to match the search query
3. THE Plugin SHALL display Oracle Tables whose names contain the search text
4. THE Plugin SHALL show which Table Section contains each matching Oracle Table
5. WHEN the search field is empty, THE Plugin SHALL display all Oracle Tables in their normal organization

### Requirement 6

**User Story:** As a solo RPG player, I want the plugin to include core Mythic GME v2 oracle tables, so that I have the essential tools for running solo RPG sessions.

#### Acceptance Criteria

1. THE Plugin SHALL include the Fate Chart oracle from Mythic GME v2
2. THE Plugin SHALL include the Event Meaning tables (Action and Description) from Mythic GME v2
3. THE Plugin SHALL include the Descriptor tables from Mythic GME v2
4. THE Plugin SHALL implement the Chaos Factor mechanics where applicable
5. THE Plugin SHALL provide accurate table data matching the published Mythic GME v2 content

### Requirement 7

**User Story:** As a solo RPG player, I want to access additional oracle tables from Mythic Magazine, so that I can expand my oracle options beyond the core system.

#### Acceptance Criteria

1. THE Plugin SHALL include oracle tables from Mythic Magazine publications
2. THE Plugin SHALL organize Mythic Magazine tables in separate Table Sections from core Mythic GME v2 tables
3. THE Plugin SHALL clearly label which tables come from Mythic Magazine versus core Mythic GME v2
4. THE Plugin SHALL support the table formats and structures used in Mythic Magazine content

### Requirement 8

**User Story:** As a solo RPG player, I want to insert roll results directly into my active note, so that I can document oracle outcomes without manually typing or pasting them.

#### Acceptance Criteria

1. THE Plugin SHALL provide an insert button or control alongside each roll result
2. WHEN the user clicks the insert control, THE Plugin SHALL insert the roll result into the Active Note at the current cursor position
3. THE Plugin SHALL format inserted results in a readable format that includes the table name and result value
4. WHEN no Active Note is open, THE Plugin SHALL display a notification to the user
5. THE Plugin SHALL maintain the cursor position in the Active Note after insertion

### Requirement 9

**User Story:** As a solo RPG player, I want to set the Chaos Factor and Odds when rolling on the Fate Chart, so that I can get contextually appropriate yes/no answers based on my current game state.

#### Acceptance Criteria

1. WHEN the user selects the Fate Chart Oracle Table, THE Plugin SHALL display input controls for Chaos Factor and Odds
2. THE Plugin SHALL provide a numeric input for Chaos Factor with a range of 1 to 9
3. THE Plugin SHALL provide a selection control for Odds with options matching Mythic GME v2 (Impossible, No Way, Very Unlikely, Unlikely, 50/50, Somewhat Likely, Likely, Very Likely, Near Sure Thing, A Sure Thing, Has To Be)
4. WHEN the user performs a Fate Chart Roll, THE Plugin SHALL use the specified Chaos Factor and Odds to determine the result
5. THE Plugin SHALL persist the last used Chaos Factor and Odds values across rolls

### Requirement 10

**User Story:** As a solo RPG player, I want to generate random scene setups by rolling multiple related tables at once, so that I can quickly create scene events without multiple manual rolls.

#### Acceptance Criteria

1. THE Plugin SHALL provide a combined roll control for Event Meaning that rolls both Action and Description tables
2. WHEN the user triggers the Event Meaning combined roll, THE Plugin SHALL generate results from both the Action table and Description table
3. THE Plugin SHALL display both results together in a formatted output
4. THE Plugin SHALL copy the combined Event Meaning result to the clipboard
5. THE Plugin SHALL support inserting the combined Event Meaning result into the Active Note
