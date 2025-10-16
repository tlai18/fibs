// Animation utility functions

import { ANIMATION_DURATIONS, TRANSITION_DELAYS } from '../constants/ui';

/**
 * Create staggered animation delays for list items
 */
export function createStaggeredDelay(index: number, baseDelay: number = 100): number {
  return index * baseDelay;
}

/**
 * Create fade-in animation styles
 */
export function createFadeInStyle(delay: number = 0, duration: number = ANIMATION_DURATIONS.NORMAL) {
  return {
    animation: `fadeIn ${duration}ms ease-in-out ${delay}ms both`,
  };
}

/**
 * Create slide-up animation styles
 */
export function createSlideUpStyle(delay: number = 0, duration: number = ANIMATION_DURATIONS.NORMAL) {
  return {
    animation: `slideUp ${duration}ms ease-out ${delay}ms both`,
  };
}

/**
 * Create scale animation styles
 */
export function createScaleStyle(delay: number = 0, duration: number = ANIMATION_DURATIONS.FAST) {
  return {
    animation: `scale ${duration}ms ease-out ${delay}ms both`,
  };
}

/**
 * Get answer reveal timing
 */
export function getAnswerRevealTiming(index: number) {
  const baseDelay = TRANSITION_DELAYS.ANSWER_REVEAL;
  const staggerDelay = createStaggeredDelay(index, 200);
  return baseDelay + staggerDelay;
}

/**
 * Get true prompt reveal timing
 */
export function getTruePromptRevealTiming() {
  return TRANSITION_DELAYS.TRUE_PROMPT_REVEAL;
}
