/**
 * Pack definitions — matches spec pricing and rarity tiers.
 * Rarity tiers: common / elite / legendary / mythic
 * Prices: $10 / $25 / $50 / $100 USDC
 */

export interface PackDef {
  id: string;
  name: string;
  type: string;
  price_usd: number;
  emoji: string;
  weights: Record<string, number>;
}

export interface RewardItem {
  name: string;
  type: string;
  rarity: 'common' | 'elite' | 'legendary' | 'mythic';
  img: string;
  skinTypeId?: string;
  serialNumber?: number;
  maxSupply?: number;
}

export const PACKS: Record<string, PackDef> = {
  'common-pack': {
    id: 'common-pack',
    name: 'Common Pack',
    type: 'Common Pack',
    price_usd: 10,
    emoji: '\u{1F4E6}',
    weights: { common: 70, elite: 25, legendary: 4, mythic: 1 },
  },
  'elite-pack': {
    id: 'elite-pack',
    name: 'Elite Pack',
    type: 'Elite Pack',
    price_usd: 50,
    emoji: '\u2694\uFE0F',
    weights: { common: 50, elite: 35, legendary: 12, mythic: 3 },
  },
  'legendary-pack': {
    id: 'legendary-pack',
    name: 'Legendary Pack',
    type: 'Legendary Pack',
    price_usd: 100,
    emoji: '\u{1F3B4}',
    weights: { common: 30, elite: 40, legendary: 22, mythic: 8 },
  },
  'mythic-pack': {
    id: 'mythic-pack',
    name: 'Mythic Pack',
    type: 'Mythic Pack',
    price_usd: 250,
    emoji: '\u{1F451}',
    weights: { common: 10, elite: 35, legendary: 35, mythic: 20 },
  },
};

export const RARITY_COLORS: Record<string, string> = {
  common: '#9CA3AF',
  elite: '#3B82F6',
  legendary: '#F59E0B',
  mythic: '#EC4899',
};

export const RARITY_GLOW: Record<string, string> = {
  common: 'rgba(156,163,175,0.3)',
  elite: 'rgba(59,130,246,0.4)',
  legendary: 'rgba(245,158,11,0.5)',
  mythic: 'rgba(236,72,153,0.5)',
};
