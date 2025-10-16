// UI-related constants

export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
} as const;

export const TRANSITION_DELAYS = {
  ANSWER_REVEAL: 1500,
  TRUE_PROMPT_REVEAL: 3000,
  PHASE_TRANSITION: 500
} as const;

export const BUTTON_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
} as const;

export type ButtonSize = typeof BUTTON_SIZES[keyof typeof BUTTON_SIZES];

export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DANGER: 'danger',
  SUCCESS: 'success'
} as const;

export type ButtonVariant = typeof BUTTON_VARIANTS[keyof typeof BUTTON_VARIANTS];

export const TOAST_DURATIONS = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000
} as const;
