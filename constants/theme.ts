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
  common: '#8B8B8B',
  rare: '#4A90D9',
  epic: '#9B59B6',
  legendary: '#F5C518',
  mythic: '#FF4444',

  // Status
  success: '#2ECC71',
  error: '#E74C3C',
  warning: '#F39C12',

  // Misc
  overlay: 'rgba(0,0,0,0.7)',
  divider: '#2a2a4a',
} as const;

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export const RARITY_COLORS: Record<Rarity, string> = {
  common: COLORS.common,
  rare: COLORS.rare,
  epic: COLORS.epic,
  legendary: COLORS.legendary,
  mythic: COLORS.mythic,
};

export const RARITY_GRADIENTS: Record<Rarity, [string, string]> = {
  common: ['#3a3a3a', '#1a1a1a'],
  rare: ['#1a3a5a', '#0a1a2e'],
  epic: ['#3a1a4a', '#1a0a2e'],
  legendary: ['#4a3a0a', '#2e1a00'],
  mythic: ['#4a0a0a', '#2e0000'],
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
