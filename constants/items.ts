import { ImageSourcePropType } from 'react-native';
import { Rarity } from './theme';

export type ItemType = 'skin' | 'weapon' | 'emote' | 'bundle';

export interface ShopItem {
  id: string;
  name: string;
  type: ItemType;
  typeName: string;
  rarity: Rarity;
  price: number;
  description: string;
  image: ImageSourcePropType;
  category: string;
  badge?: string;
  bgGradient: [string, string, string];
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

export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: 'featured',
    title: 'Featured',
    items: [
      { id: 'giga-chad', name: 'Giga Chad', type: 'skin', typeName: 'Legendary Skin', rarity: 'legendary', price: 2200, description: 'The ultimate sigma male skin. Dominate the trenches.', image: IMG.gigaChad, category: 'featured', badge: 'LEGENDARY', bgGradient: ['#646490', '#32325a', '#1a1a2e'] },
      { id: 'ibiza-boss', name: 'Ibiza Final Boss', type: 'skin', typeName: 'Legendary Skin', rarity: 'legendary', price: 2000, description: 'Rule the battlefield in style.', image: IMG.ibiza, category: 'featured', badge: 'LEGENDARY', bgGradient: ['#8c64c8', '#502896', '#2a1555'] },
      { id: 'pepe-feat', name: 'Pepe', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1500, description: 'The classic frog enters the trenches.', image: IMG.pepe, category: 'featured', bgGradient: ['#8cdc8c', '#3ca03c', '#1e641e'] },
      { id: 'unicorn-feat', name: 'Unicorn Fart Dust', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1800, description: 'Magical and deadly.', image: IMG.unicorn, category: 'featured', bgGradient: ['#ffb4dc', '#e678b4', '#c74b8c'] },
      { id: 'shiba-feat', name: 'Shiba Inu', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1500, description: 'Much wow, very battle.', image: IMG.shiba, category: 'featured', bgGradient: ['#ffdc50', '#dcaa1e', '#a06e0a'] },
      { id: 'pengu-feat', name: 'Pengu', type: 'skin', typeName: 'Rare Skin', rarity: 'rare', price: 1200, description: 'Cool as ice.', image: IMG.pengu, category: 'featured', bgGradient: ['#78bee6', '#3c8cc8', '#1a5276'] },
      { id: 'chill-feat', name: 'Chill Guy', type: 'skin', typeName: 'Rare Skin', rarity: 'rare', price: 1200, description: 'Just vibing through the trenches.', image: IMG.chill, category: 'featured', bgGradient: ['#d2aa82', '#a06e46', '#6b4226'] },
      { id: 'labubu-feat', name: 'Labubu', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1500, description: 'The mischievous one.', image: IMG.labubu, category: 'featured', bgGradient: ['#f06464', '#c83232', '#8b1a1a'] },
    ],
  },
  {
    id: 'sigma',
    title: 'Sigma Collection',
    items: [
      { id: 'giga-chad', name: 'Giga Chad', type: 'skin', typeName: 'Legendary Skin', rarity: 'legendary', price: 2200, description: 'The ultimate sigma male skin.', image: IMG.gigaChad, category: 'sigma', badge: 'LEGENDARY', bgGradient: ['#646490', '#32325a', '#1a1a2e'] },
      { id: 'giga-sword', name: 'Giga Sword', type: 'weapon', typeName: 'Legendary Weapon', rarity: 'legendary', price: 1800, description: 'Cut through the competition.', image: IMG.gigaSword, category: 'sigma', badge: 'NEW!', bgGradient: ['#b4a078', '#8b7355', '#5a4632'] },
      { id: '300-rise-of-chad', name: '300 Rise of the Chad', type: 'skin', typeName: 'Legendary Skin', rarity: 'legendary', price: 2500, description: 'This is Sparta... I mean Trenches.', image: IMG.rise300, category: 'sigma', badge: 'LEGENDARY', bgGradient: ['#c85050', '#a02828', '#8b0000'] },
      { id: 'chad-commandant', name: 'Chad Commandant', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 2000, description: 'Leading the charge.', image: IMG.commandant, category: 'sigma', bgGradient: ['#8c6e50', '#644b37', '#4a3728'] },
    ],
  },
  {
    id: 'warrior',
    title: 'The Warrior Collective',
    items: [
      { id: 'chill-guy', name: 'Chill Guy', type: 'skin', typeName: 'Rare Skin', rarity: 'rare', price: 1200, description: 'Just vibing through the trenches.', image: IMG.chillWarrior, category: 'warrior', bgGradient: ['#d2aa82', '#a06e46', '#6b4226'] },
      { id: 'chill-sensei', name: 'Just a Chill Sensei', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1800, description: 'Master of chill combat.', image: IMG.chillSensei, category: 'warrior', badge: 'NEW!', bgGradient: ['#c85050', '#a02828', '#8b0000'] },
      { id: 'chill-tana', name: 'Chill-tana', type: 'weapon', typeName: 'Epic Weapon', rarity: 'epic', price: 1500, description: 'The chillest blade.', image: IMG.chillTana, category: 'warrior', bgGradient: ['#ffb4dc', '#e678b4', '#c74b8c'] },
    ],
  },
  {
    id: 'pepe',
    title: 'Pepe',
    items: [
      { id: 'pepe', name: 'Pepe', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1500, description: 'The classic frog.', image: IMG.pepe, category: 'pepe', bgGradient: ['#8cdc8c', '#3ca03c', '#1e641e'] },
      { id: 'gaspy', name: 'Gaspy', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1800, description: 'The shocked frog.', image: IMG.gaspy, category: 'pepe', badge: 'NEW!', bgGradient: ['#8cdc8c', '#3ca03c', '#1e641e'] },
      { id: 'caesar', name: 'Caesar', type: 'skin', typeName: 'Legendary Skin', rarity: 'legendary', price: 2500, description: 'Ave, true to Pepe.', image: IMG.caesar, category: 'pepe', badge: 'LEGENDARY', bgGradient: ['#c8a050', '#b47828', '#8b5014'] },
      { id: 'lily-pad-staff', name: 'Lily Pad Staff', type: 'weapon', typeName: 'Epic Weapon', rarity: 'epic', price: 1600, description: 'Nature strikes back.', image: IMG.lilyPad, category: 'pepe', badge: 'NEW!', bgGradient: ['#8cdc8c', '#3ca03c', '#1e641e'] },
    ],
  },
  {
    id: 'doge',
    title: 'Doge',
    items: [
      { id: 'shiba-inu', name: 'Shiba Inu', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1500, description: 'Much wow, very battle.', image: IMG.shiba, category: 'doge', bgGradient: ['#ffdc50', '#dcaa1e', '#a06e0a'] },
      { id: 'dogwifhat', name: 'Dogwifhat', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1800, description: 'Dog wif hat.', image: IMG.dogwifhat, category: 'doge', badge: 'NEW!', bgGradient: ['#ffdc50', '#dcaa1e', '#a06e0a'] },
      { id: 'thug-lyfe', name: 'Thug Lyfe', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1800, description: 'Gangsta dog.', image: IMG.thugLyfe, category: 'doge', badge: 'NEW!', bgGradient: ['#ffdc50', '#dcaa1e', '#a06e0a'] },
      { id: 'moon-bound', name: 'Moon Bound', type: 'skin', typeName: 'Legendary Skin', rarity: 'legendary', price: 2200, description: 'To the moon!', image: IMG.moonBound, category: 'doge', badge: 'LEGENDARY', bgGradient: ['#ffdc50', '#dcaa1e', '#a06e0a'] },
    ],
  },
  {
    id: 'pengu',
    title: 'Pengu',
    items: [
      { id: 'pengu', name: 'Pengu', type: 'skin', typeName: 'Rare Skin', rarity: 'rare', price: 1200, description: 'Cool as ice.', image: IMG.pengu, category: 'pengu', bgGradient: ['#78bee6', '#3c8cc8', '#1a5276'] },
      { id: 'sword-fish', name: 'Sword Fish', type: 'weapon', typeName: 'Epic Weapon', rarity: 'epic', price: 1500, description: 'Fishy business.', image: IMG.swordFish, category: 'pengu', badge: 'NEW!', bgGradient: ['#78bee6', '#3c8cc8', '#1a5276'] },
      { id: 'nietzsche-penguin', name: 'Nietzsche Penguin', type: 'skin', typeName: 'Epic Skin', rarity: 'epic', price: 1800, description: 'God is dead and Pengu killed him.', image: IMG.nietzsche, category: 'pengu', badge: 'NEW!', bgGradient: ['#78bee6', '#3c8cc8', '#1a5276'] },
    ],
  },
  {
    id: 'pump',
    title: 'The Pump Collective',
    items: [
      { id: 'pump-pill', name: 'Pump Pill', type: 'skin', typeName: 'Common Skin', rarity: 'common', price: 500, description: 'Take the pump pill.', image: IMG.pumpPill, category: 'pump', bgGradient: ['#64c864', '#329632', '#145014'] },
      { id: 'pump-pill-founder', name: 'Pump Pill Founder Edition', type: 'skin', typeName: 'Exclusive Skin', rarity: 'legendary', price: 5000, description: 'OG pump status.', image: IMG.pumpFounder, category: 'pump', badge: 'FOUNDER', bgGradient: ['#64c864', '#329632', '#145014'] },
      { id: 'a1lon9', name: 'a1lon9', type: 'skin', typeName: 'Mystic Skin', rarity: 'mythic', price: -1, description: 'The one and only.', image: IMG.a1lon9, category: 'pump', badge: '1 OF 1', bgGradient: ['#b464dc', '#8232aa', '#501478'] },
    ],
  },
];

export function getItemById(id: string): ShopItem | undefined {
  for (const cat of SHOP_CATEGORIES) {
    const item = cat.items.find(i => i.id === id);
    if (item) return item;
  }
  return undefined;
}
