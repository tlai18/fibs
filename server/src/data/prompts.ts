// Centralized prompt data
// This file imports prompts from JSON and provides TypeScript interfaces

import promptsData from './prompts.json';

export interface PromptData {
  textTrue: string;
  textDecoy: string;
}

// Import prompts from JSON file
export const PROMPTS: PromptData[] = promptsData as PromptData[];

// Helper functions for working with prompts
export const getRandomPrompt = (): PromptData => {
  const randomIndex = Math.floor(Math.random() * PROMPTS.length);
  return PROMPTS[randomIndex];
};
