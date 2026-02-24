export const COLORS = {
  // Core
  background: '#0a0a14',
  surface: '#16162a',
  card: '#1a1a2e',
  cardBorder: '#2a2a4a',

  // Brand
  primary: '#f5c518',
  primaryDim: '#c49a10',
  accent: '#E8FF00',

  // Text
  text: '#FFFFFF',
  textSecondary: '#8B8FA3',
  textMuted: '#5A5E72',

  // Rarity
  common: '#b0b0b0',
  rare: '#3090ff',
  epic: '#b040ff',
  legendary: '#ff8c00',
  exclusive: '#FFD700',
  mythic: '#6B238E',

  // Status
  success: '#2ECC71',
  error: '#E74C3C',
  warning: '#F39C12',

  // Misc
  overlay: 'rgba(0,0,0,0.7)',
  divider: '#2a2a4a',
} as const;

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'exclusive' | 'mythic';

export const RARITY_COLORS: Record<Rarity, string> = {
  common: COLORS.common,
  rare: COLORS.rare,
  epic: COLORS.epic,
  legendary: COLORS.legendary,
  exclusive: COLORS.exclusive,
  mythic: COLORS.mythic,
};

export const RARITY_GRADIENTS: Record<Rarity, [string, string]> = {
  common: ['#4a4a4a', '#2a2a2a'],
  rare: ['#1a5276', '#0d2847'],
  epic: ['#6a2d9c', '#3a1560'],
  legendary: ['#b8640b', '#6b3a08'],
  exclusive: ['#b8960b', '#6b5808'],
  mythic: ['#6B238E', '#3a1150'],
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  black: 'Inter_900Black',
} as const;
