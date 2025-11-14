**Fate Chart**: No (Chaos: 1, Odds: 50/50)
**Example Custom Oracle**: Very unlikely outcome
**Example Custom Oracle**: Unlikely outcome
# Custom Oracle Tables

This folder contains custom oracle tables for the Mythic GME plugin.

## JSON Format

Each JSON file can contain either a single table object or an array of table objects.

### Required Fields

- `id`: Unique identifier (string, lowercase-with-hyphens)
- `name`: Display name (string)
- `category`: Category for grouping (string, use "/" for subcategories)
- `type`: Oracle type (must be: "Tool", "Variation", "Standard", or "Descriptor")
- `diceType`: Dice type (must be: "d100", "d20", "d10", "d6", or "custom")
- `entries`: Array of range/result pairs

### Optional Fields

- `description`: Description of the oracle (string)

### Entry Format

Each entry must have:
- `range`: Array of two numbers [min, max] (inclusive)
- `result`: The result text (string)

### Validation Rules

1. Ranges must not overlap
2. Ranges must cover the full dice range (e.g., 1-100 for d100)
3. Table IDs must be unique
4. All required fields must be present

### Example

See `example-table.json` for a complete example.

### Organizing Tables

Use forward slashes in category names to create subcategories:
- "Mythic Magazine/Issue 1"
- "Homebrew/Fantasy/Encounters"

### Troubleshooting

Check the plugin settings tab for validation errors if your tables don't appear.
