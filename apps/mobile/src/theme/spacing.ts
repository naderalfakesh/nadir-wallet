export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 14,
  lg: 16,
  pad: 18,
  xl: 22,
  xxl: 26,
  huge: 32,
} as const;

export type Spacing = typeof spacing;
