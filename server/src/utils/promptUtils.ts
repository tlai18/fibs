// Utility functions for prompt management and selection

import { PROMPTS } from '../data/prompts';

/**
 * Select a random prompt from all available prompts
 */
export function selectRandomPrompt(): any {
  const randomIndex = Math.floor(Math.random() * PROMPTS.length);
  return PROMPTS[randomIndex];
}

/**
 * Select a random prompt from available prompts (excluding used ones)
 */
export function selectRandomFromAvailable(availablePrompts: any[]): any {
  const randomIndex = Math.floor(Math.random() * availablePrompts.length);
  return availablePrompts[randomIndex];
}

/**
 * Get prompt statistics
 */
export function getPromptStats() {
  return {
    total: PROMPTS.length
  };
}
