/**
 * Pack definitions and reward pool — matches web version at trenchesgame.com/pack-opening
 */

export interface PackDef {
  id: string;
  name: string;
  type: string;
  itemCount: number;
  price: number;
  emoji: string;
  weights: Record<string, number>;
}

export interface RewardItem {
  name: string;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  img: string; // web URL on trenchesgame.com
  skinTypeId?: string;
  serialNumber?: number;
  maxSupply?: number;
}

export const PACKS: Record<string, PackDef> = {
  'starter-pack': {
    id: 'starter-pack',
    name: 'Starter Pack',
    type: 'Common Pack',
    itemCount: 5,
    price: 500,
    emoji: '📦',
    weights: { common: 60, rare: 30, epic: 10 },
  },
  'warrior-pack': {
    id: 'warrior-pack',
    name: 'Warrior Pack',
    type: 'Rare Pack',
    itemCount: 8,
    price: 1000,
    emoji: '⚔️',
    weights: { common: 30, rare: 45, epic: 20, legendary: 5 },
  },
  'legendary-pack': {
    id: 'legendary-pack',
    name: 'Legendary Pack',
    type: 'Legendary Pack',
    itemCount: 10,
    price: 2500,
    emoji: '🎴',
    weights: { common: 10, rare: 30, epic: 35, legendary: 25 },
  },
  'mystery-pack': {
    id: 'mystery-pack',
    name: 'Mystery Pack',
    type: 'Mystery Pack',
    itemCount: 7,
    price: 1500,
    emoji: '❓',
    weights: { common: 25, rare: 25, epic: 25, legendary: 15, mythic: 10 },
  },
};

export const REWARD_POOL: RewardItem[] = [
  { name: 'Giga Chad', type: 'Legendary Skin', rarity: 'legendary', img: 'https://trenchesgame.com/giga-chad.png' },
  { name: 'Pepe', type: 'Epic Skin', rarity: 'epic', img: 'https://trenchesgame.com/pepe.png' },
  { name: 'Shiba Inu', type: 'Epic Skin', rarity: 'epic', img: 'https://trenchesgame.com/shiba-inu.png' },
  { name: 'Pengu', type: 'Rare Skin', rarity: 'rare', img: 'https://trenchesgame.com/pengu.png' },
  { name: 'Chill Guy', type: 'Rare Skin', rarity: 'rare', img: 'https://trenchesgame.com/chill-guy-warrior.png' },
  { name: 'Pump Pill', type: 'Common Skin', rarity: 'common', img: 'https://trenchesgame.com/pump-pill.png' },
  { name: 'Gaspy', type: 'Epic Skin', rarity: 'epic', img: 'https://trenchesgame.com/gaspy.png' },
  { name: 'Caesar', type: 'Legendary Skin', rarity: 'legendary', img: 'https://trenchesgame.com/caesar.png' },
  { name: 'Dogwifhat', type: 'Epic Skin', rarity: 'epic', img: 'https://trenchesgame.com/dogwifhat.png' },
  { name: 'Thug Lyfe', type: 'Epic Skin', rarity: 'epic', img: 'https://trenchesgame.com/thug-lyfe.png' },
  { name: 'Moon Bound', type: 'Legendary Skin', rarity: 'legendary', img: 'https://trenchesgame.com/moon-bound.png' },
  { name: 'Sword Fish', type: 'Epic Weapon', rarity: 'epic', img: 'https://trenchesgame.com/sword-fish.png' },
  { name: 'Lily Pad Staff', type: 'Epic Weapon', rarity: 'epic', img: 'https://trenchesgame.com/lily-pad-staff.png' },
  { name: 'Giga Sword', type: 'Legendary Weapon', rarity: 'legendary', img: 'https://trenchesgame.com/giga-sword.png' },
  { name: 'Chill-tana', type: 'Epic Weapon', rarity: 'epic', img: 'https://trenchesgame.com/chill-tana.png' },
  { name: 'Just a Chill Sensei', type: 'Epic Skin', rarity: 'epic', img: 'https://trenchesgame.com/chill-sensei.png' },
  { name: 'Labubu', type: 'Epic Skin', rarity: 'epic', img: 'https://trenchesgame.com/labubu.png' },
  { name: 'Unicorn Fart Dust', type: 'Epic Skin', rarity: 'epic', img: 'https://trenchesgame.com/unicorn-fart-dust.png' },
  { name: 'a1lon9', type: 'Mystic Skin', rarity: 'mythic', img: 'https://trenchesgame.com/a1lon9.png' },
  { name: 'Percolator', type: 'Epic Skin', rarity: 'epic', img: 'https://trenchesgame.com/percolator.png' },
  { name: 'Punch', type: 'Epic Skin', rarity: 'epic', img: 'https://trenchesgame.com/punch.png' },
];

export const RARITY_COLORS: Record<string, string> = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
  mythic: '#EC4899',
};

export const RARITY_GLOW: Record<string, string> = {
  common: 'rgba(156,163,175,0.3)',
  rare: 'rgba(59,130,246,0.4)',
  epic: 'rgba(168,85,247,0.4)',
  legendary: 'rgba(245,158,11,0.5)',
  mythic: 'rgba(236,72,153,0.5)',
};

/** Select a random item based on pack rarity weights */
export function selectRandomItem(weights: Record<string, number>): RewardItem {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (const [rarity, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      const pool = REWARD_POOL.filter((item) => item.rarity === rarity);
      if (pool.length > 0) {
        return pool[Math.floor(Math.random() * pool.length)];
      }
    }
  }

  return REWARD_POOL[Math.floor(Math.random() * REWARD_POOL.length)];
}
