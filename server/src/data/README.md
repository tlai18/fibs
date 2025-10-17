# Prompt Data Structure

This directory contains modular prompt data for the "Guess Who's Lying" game.

## Files

### `prompts.json`
- **Purpose**: JSON storage of all game prompts
- **Structure**: Array of prompt objects with textTrue and textDecoy
- **Features**: 
  - Simple two-field structure
  - True/Decoy text pairs
  - Easy to edit and maintain

### `prompts.ts`
- **Purpose**: TypeScript wrapper for JSON prompts
- **Structure**: Imports JSON data and provides TypeScript interfaces
- **Features**: 
  - Type safety with `PromptData` interface
  - Helper functions for filtering and analysis
  - Easy import for other services

### `validate-prompts.js`
- **Purpose**: Validation script for prompts.json
- **Features**: 
  - Validates JSON syntax and structure
  - Checks required fields and data types
  - Provides basic statistics
  - Run with: `node validate-prompts.js`

## Usage

```typescript
import { PROMPTS, getRandomPrompt } from '../data/prompts';

// Get all prompts
console.log(PROMPTS.length);

// Get a random prompt
const randomPrompt = getRandomPrompt();
```

## Adding New Prompts

To add new prompts:

1. **Edit `prompts.json`**
2. **Add to the JSON array**:
   ```json
   {
     "textTrue": "Specific true prompt",
     "textDecoy": "More general decoy prompt"
   }
   ```
3. **Run database seed** to update the database:
   ```bash
   npm run db:seed
   ```

## Prompt Structure

Each prompt contains:
- **textTrue**: The specific prompt for truth-tellers
- **textDecoy**: The more general prompt for the liar

The game randomly selects prompts and assigns roles to players.



