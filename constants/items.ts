import { ImageSourcePropType } from 'react-native';
import { Rarity } from './theme';

export type ItemType = 'skin' | 'weapon' | 'emote' | 'bundle';

export type ItemColor = 'Gold' | 'Green' | 'Blue' | 'Purple' | 'Red' | 'Pink' | 'Orange';

export const ITEM_COLORS: { name: ItemColor; hex: string }[] = [
  { name: 'Gold', hex: '#ffcc00' },
  { name: 'Green', hex: '#44ff44' },
  { name: 'Blue', hex: '#4488ff' },
  { name: 'Purple', hex: '#aa44ff' },
  { name: 'Red', hex: '#ff4444' },
  { name: 'Pink', hex: '#ff66cc' },
  { name: 'Orange', hex: '#ff8c00' },
];

export const COLLECTIONS = [
  'Sigma Collection',
  'The Warrior Collective',
  'Pepe',
  'Doge',
  'Pengu',
  'The Pump Collective',
] as const;

export type Collection = typeof COLLECTIONS[number];

export interface ShopItem {
  id: string;
  name: string;
  type: ItemType;
  typeName: string;
  rarity: Rarity;
  price: number;
  description: string;
  specs: string;
  collection: Collection;
  color: ItemColor;
  image: ImageSourcePropType;
  category: string;
  badge?: string;
  bgGradient: [string, string, string];
  model?: string;
  cameraOrbit?: string;
}

export interface ShopCategory {
  id: string;
  title: string;
  items: ShopItem[];
}

// Images
const IMG = {
  gigaChad: require('../assets/shop/giga-chad.png'),
  ibiza: require('../assets/shop/ibiza-final-boss.png'),
  pepe: require('../assets/shop/pepe.png'),
  unicorn: require('../assets/shop/unicorn-fart-dust.png'),
  shiba: require('../assets/shop/shiba-inu.png'),
  pengu: require('../assets/shop/pengu.png'),
  chill: require('../assets/shop/chill-guy.png'),
  labubu: require('../assets/shop/labubu.jpg'),
  gigaSword: require('../assets/shop/giga-sword.png'),
  rise300: require('../assets/shop/300-rise-of-chad.png'),
  commandant: require('../assets/shop/chad-commandant.png'),
  chillWarrior: require('../assets/shop/chill-guy-warrior.png'),
  chillSensei: require('../assets/shop/chill-sensei.png'),
  chillTana: require('../assets/shop/chill-tana.png'),
  gaspy: require('../assets/shop/gaspy.png'),
  caesar: require('../assets/shop/caesar.png'),
  lilyPad: require('../assets/shop/lily-pad-staff.png'),
  dogwifhat: require('../assets/shop/dogwifhat.png'),
  thugLyfe: require('../assets/shop/thug-lyfe.png'),
  moonBound: require('../assets/shop/moon-bound.png'),
  swordFish: require('../assets/shop/sword-fish.png'),
  nietzsche: require('../assets/shop/nietzsche-penguin.png'),
  pumpPill: require('../assets/shop/pump-pill.png'),
  pumpFounder: require('../assets/shop/pump-pill-founder.png'),
  a1lon9: require('../assets/shop/a1lon9.png'),
};

// ─── Canonical marketplace items (matching marketplace-data.js exactly) ───

const GIGA_CHAD: ShopItem = {
  id: 'giga-chad', name: 'Giga Chad', type: 'skin', typeName: 'Legendary Skin', rarity: 'legendary', price: 2200,
  collection: 'Sigma Collection', color: 'Purple',
  description: 'The ultimate sigma male skin. Dominate the trenches with peak physical form.',
  specs: 'Alpha energy radiates from every movement. Custom walk cycle.',
  image: IMG.gigaChad, category: 'sigma', badge: 'LEGENDARY',
  bgGradient: ['#646490', '#32325a', '#1a1a2e'],
};

const GIGA_SWORD: ShopItem = {
  id: 'giga-sword', name: 'Giga Sword', type: 'weapon', typeName: 'Legendary Weapon', rarity: 'legendary', price: 1800,
  collection: 'Sigma Collection', color: 'Gold',
  description: 'A massive blade forged for true warriors. Strike fear into your enemies.',
  specs: '3D model with dynamic lighting effects.',
  image: IMG.gigaSword, category: 'sigma', badge: 'NEW!',
  bgGradient: ['#b4a078', '#8b7355', '#5a4632'], model: 'giga-sword.glb',
};

const RISE_300: ShopItem = {
  id: '300-rise-of-chad', name: '300 Rise of the Chad', type: 'skin', typeName: 'Legendary Skin', rarity: 'legendary', price: 2500,
  collection: 'Sigma Collection', color: 'Red',
  description: 'Channel the spirit of ancient Spartan warriors. THIS IS TRENCHES!',
  specs: '3D model with battle-ready animations.',
  image: IMG.rise300, category: 'sigma', badge: 'LEGENDARY',
  bgGradient: ['#c85050', '#a02828', '#8b0000'], model: '300-rise-of-chad.glb',
};

const CHAD_COMMANDANT: ShopItem = {
  id: 'chad-commandant', name: 'Chad Commandant', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 2000,
  collection: 'Sigma Collection', color: 'Gold',
  description: 'Command your troops with authority. Lead from the front.',
  specs: '3D model with commander stance.',
  image: IMG.commandant, category: 'sigma',
  bgGradient: ['#8c6e50', '#644b37', '#4a3728'], model: 'chad-commandant.glb',
};

const CHILL_GUY: ShopItem = {
  id: 'chill-guy', name: 'Chill Guy', type: 'skin', typeName: 'Rare Skin', rarity: 'rare', price: 1200,
  collection: 'The Warrior Collective', color: 'Gold',
  description: 'Stay relaxed even in the heat of battle. Cool under pressure.',
  specs: 'Calm demeanor with smooth animations.',
  image: IMG.chillWarrior, category: 'warrior',
  bgGradient: ['#d2aa82', '#a06e46', '#6b4226'],
};

const CHILL_SENSEI: ShopItem = {
  id: 'chill-sensei', name: 'Just a Chill Sensei', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1800,
  collection: 'The Warrior Collective', color: 'Red',
  description: 'Master of the chill arts. Teaches tranquility through combat.',
  specs: '3D model with sensei robes and effects.',
  image: IMG.chillSensei, category: 'warrior', badge: 'NEW!',
  bgGradient: ['#c85050', '#a02828', '#8b0000'], model: 'chill-sensei.glb',
};

const CHILL_TANA: ShopItem = {
  id: 'chill-tana', name: 'Chill-tana', type: 'weapon', typeName: 'Epic Weapon', rarity: 'epic', price: 1500,
  collection: 'The Warrior Collective', color: 'Pink',
  description: 'A beautifully crafted katana with cherry blossom details.',
  specs: '3D model with cherry blossom particle effects.',
  image: IMG.chillTana, category: 'warrior',
  bgGradient: ['#ffb4dc', '#e678b4', '#c74b8c'], model: 'chill-tana.glb',
};

const PEPE: ShopItem = {
  id: 'pepe', name: 'Pepe', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1500,
  collection: 'Pepe', color: 'Green',
  description: 'The legendary meme frog. Feels good man.',
  specs: 'Classic Pepe with signature expressions.',
  image: IMG.pepe, category: 'pepe',
  bgGradient: ['#8cdc8c', '#3ca03c', '#1e641e'],
};

const GASPY: ShopItem = {
  id: 'gaspy', name: 'Gaspy', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1800,
  collection: 'Pepe', color: 'Green',
  description: 'A sophisticated frog of distinguished taste and refinement.',
  specs: '3D model with monocle and top hat details.',
  image: IMG.gaspy, category: 'pepe', badge: 'NEW!',
  bgGradient: ['#8cdc8c', '#3ca03c', '#1e641e'], model: 'gaspy.glb',
};

const CAESAR: ShopItem = {
  id: 'caesar', name: 'Caesar', type: 'skin', typeName: 'Legendary Skin', rarity: 'legendary', price: 2500,
  collection: 'Pepe', color: 'Gold',
  description: 'Emperor of the frogs. Veni, vidi, vici - in the trenches.',
  specs: '3D model with imperial Roman attire and laurel crown.',
  image: IMG.caesar, category: 'pepe', badge: 'LEGENDARY',
  bgGradient: ['#c8a050', '#b47828', '#8b5014'], model: 'caesar.glb',
};

const LILY_PAD: ShopItem = {
  id: 'lily-pad-staff', name: 'Lily Pad Staff', type: 'weapon', typeName: 'Epic Weapon', rarity: 'epic', price: 1600,
  collection: 'Pepe', color: 'Green',
  description: 'A mystical staff infused with the power of nature. Channel the swamp.',
  specs: '3D model with nature particle effects.',
  image: IMG.lilyPad, category: 'pepe', badge: 'NEW!',
  bgGradient: ['#8cdc8c', '#3ca03c', '#1e641e'], model: 'lily-pad-staff.glb',
};

const SHIBA: ShopItem = {
  id: 'shiba-inu', name: 'Shiba Inu', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1500,
  collection: 'Doge', color: 'Gold',
  description: 'The original doge. Much wow, very meme.',
  specs: 'Classic shibe with wholesome energy.',
  image: IMG.shiba, category: 'doge',
  bgGradient: ['#ffdc50', '#dcaa1e', '#a06e0a'],
};

const DOGWIFHAT: ShopItem = {
  id: 'dogwifhat', name: 'Dogwifhat', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1800,
  collection: 'Doge', color: 'Gold',
  description: 'Just a buff doge with a pink beanie. Simple as.',
  specs: '3D model with signature pink beanie.',
  image: IMG.dogwifhat, category: 'doge', badge: 'NEW!',
  bgGradient: ['#ffdc50', '#dcaa1e', '#a06e0a'], model: 'dogwifhat.glb',
};

const THUG_LYFE: ShopItem = {
  id: 'thug-lyfe', name: 'Thug Lyfe', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1800,
  collection: 'Doge', color: 'Gold',
  description: 'Deal with it. Maximum swag achieved.',
  specs: '3D model with pixel sunglasses effect.',
  image: IMG.thugLyfe, category: 'doge', badge: 'NEW!',
  bgGradient: ['#ffdc50', '#dcaa1e', '#a06e0a'], model: 'thug-lyfe.glb',
};

const MOON_BOUND: ShopItem = {
  id: 'moon-bound', name: 'Moon Bound', type: 'skin', typeName: 'Legendary Skin', rarity: 'legendary', price: 2200,
  collection: 'Doge', color: 'Gold',
  description: 'To the moon! Doge in full NASA astronaut gear.',
  specs: '3D model with astronaut suit and helmet.',
  image: IMG.moonBound, category: 'doge', badge: 'LEGENDARY',
  bgGradient: ['#ffdc50', '#dcaa1e', '#a06e0a'], model: 'moon-bound.glb',
};

const PENGU: ShopItem = {
  id: 'pengu', name: 'Pengu', type: 'skin', typeName: 'Rare Skin', rarity: 'rare', price: 1200,
  collection: 'Pengu', color: 'Blue',
  description: 'The adorable penguin that captured the hearts of millions.',
  specs: 'Cute waddle animation included.',
  image: IMG.pengu, category: 'pengu',
  bgGradient: ['#78bee6', '#3c8cc8', '#1a5276'],
};

const SWORD_FISH: ShopItem = {
  id: 'sword-fish', name: 'Sword Fish', type: 'weapon', typeName: 'Epic Weapon', rarity: 'epic', price: 1500,
  collection: 'Pengu', color: 'Blue',
  description: 'A legendary blade forged from the depths of the ocean.',
  specs: '3D model with ocean shimmer effects.',
  image: IMG.swordFish, category: 'pengu', badge: 'NEW!',
  bgGradient: ['#78bee6', '#3c8cc8', '#1a5276'], model: 'sword-fish.glb', cameraOrbit: '45deg 75deg 25m',
};

const NIETZSCHE: ShopItem = {
  id: 'nietzsche-penguin', name: 'Nietzsche Penguin', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1800,
  collection: 'Pengu', color: 'Blue',
  description: 'When you gaze into the abyss, the abyss waves back.',
  specs: '3D model with philosophical gravitas.',
  image: IMG.nietzsche, category: 'pengu', badge: 'NEW!',
  bgGradient: ['#78bee6', '#3c8cc8', '#1a5276'], model: 'nietzsche-penguin.glb',
};

const PUMP_PILL: ShopItem = {
  id: 'pump-pill', name: 'Pump Pill', type: 'skin', typeName: 'Common Skin', rarity: 'common', price: 500,
  collection: 'The Pump Collective', color: 'Green',
  description: 'Take the green pill. Embrace the pump.',
  specs: '3D model with glowing green aura.',
  image: IMG.pumpPill, category: 'pump',
  bgGradient: ['#64c864', '#329632', '#145014'], model: 'pump-pill.glb',
};

const PUMP_FOUNDER: ShopItem = {
  id: 'pump-pill-founder', name: 'Pump Pill Founder Edition', type: 'skin', typeName: 'Exclusive Skin', rarity: 'exclusive', price: 5000,
  collection: 'The Pump Collective', color: 'Gold',
  description: 'Exclusive founder edition. Only for pump.fun employees.',
  specs: '3D model with exclusive gold trim and founder badge.',
  image: IMG.pumpFounder, category: 'pump', badge: 'FOUNDER',
  bgGradient: ['#64c864', '#329632', '#145014'], model: 'pump-pill-founder.glb',
};

const A1LON9: ShopItem = {
  id: 'a1lon9', name: 'a1lon9', type: 'skin', typeName: 'Mystic Skin', rarity: 'mythic', price: -1,
  collection: 'The Pump Collective', color: 'Purple',
  description: 'Exclusive 1 of 1. Only playable by a1lon9.',
  specs: '3D model - Mystic tier, completely unique.',
  image: IMG.a1lon9, category: 'pump', badge: '1 OF 1',
  bgGradient: ['#b464dc', '#8232aa', '#501478'], model: 'a1lon9.glb',
};

// ─── Featured-only items (not in marketplace, shop-exclusive) ───

const IBIZA_BOSS: ShopItem = {
  id: 'ibiza-boss', name: 'Ibiza Final Boss', type: 'skin', typeName: 'Legendary Skin', rarity: 'legendary', price: 2000,
  collection: 'Sigma Collection', color: 'Purple',
  description: 'Rule the battlefield in style. The final boss of Ibiza.',
  specs: 'Exclusive party skin with VIP energy.',
  image: IMG.ibiza, category: 'featured', badge: 'LEGENDARY',
  bgGradient: ['#8c64c8', '#502896', '#2a1555'],
};

const UNICORN: ShopItem = {
  id: 'unicorn-feat', name: 'Unicorn Fart Dust', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1800,
  collection: 'The Warrior Collective', color: 'Pink',
  description: 'Magical and deadly. Rainbows follow in your wake.',
  specs: 'Rainbow particle trail on movement.',
  image: IMG.unicorn, category: 'featured',
  bgGradient: ['#ffb4dc', '#e678b4', '#c74b8c'],
};

const LABUBU: ShopItem = {
  id: 'labubu-feat', name: 'Labubu', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1500,
  collection: 'The Warrior Collective', color: 'Red',
  description: 'The mischievous one. Chaos is a ladder.',
  specs: 'Mischievous idle animations.',
  image: IMG.labubu, category: 'featured',
  bgGradient: ['#f06464', '#c83232', '#8b1a1a'],
};

// ─── Marketplace: flat list of all 21 canonical items ───

export const MARKETPLACE_ITEMS: ShopItem[] = [
  GIGA_CHAD, GIGA_SWORD, RISE_300, CHAD_COMMANDANT,
  CHILL_GUY, CHILL_SENSEI, CHILL_TANA,
  PEPE, GASPY, CAESAR, LILY_PAD,
  SHIBA, DOGWIFHAT, THUG_LYFE, MOON_BOUND,
  PENGU, SWORD_FISH, NIETZSCHE,
  PUMP_PILL, PUMP_FOUNDER, A1LON9,
];

// ─── Shop categories (for the Shop tab) ───

export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: 'featured',
    title: 'Featured',
    items: [GIGA_CHAD, IBIZA_BOSS, PEPE, UNICORN, SHIBA, PENGU, CHILL_GUY, LABUBU],
  },
  {
    id: 'sigma',
    title: 'Sigma Collection',
    items: [GIGA_CHAD, GIGA_SWORD, RISE_300, CHAD_COMMANDANT],
  },
  {
    id: 'warrior',
    title: 'The Warrior Collective',
    items: [CHILL_GUY, CHILL_SENSEI, CHILL_TANA],
  },
  {
    id: 'pepe',
    title: 'Pepe',
    items: [PEPE, GASPY, CAESAR, LILY_PAD],
  },
  {
    id: 'doge',
    title: 'Doge',
    items: [SHIBA, DOGWIFHAT, THUG_LYFE, MOON_BOUND],
  },
  {
    id: 'pengu',
    title: 'Pengu',
    items: [PENGU, SWORD_FISH, NIETZSCHE],
  },
  {
    id: 'pump',
    title: 'The Pump Collective',
    items: [PUMP_PILL, PUMP_FOUNDER, A1LON9],
  },
];

export function getItemById(id: string): ShopItem | undefined {
  for (const cat of SHOP_CATEGORIES) {
    const item = cat.items.find(i => i.id === id);
    if (item) return item;
  }
  return MARKETPLACE_ITEMS.find(i => i.id === id);
}
