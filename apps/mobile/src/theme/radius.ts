export const radius = {
  sm: 8,
  md: 12,
  chip: 11,
  field: 16,
  btn: 16,
  lg: 14,
  card: 22,
  sheet: 30,
  pill: 999,
} as const;

export type Radius = typeof radius;
