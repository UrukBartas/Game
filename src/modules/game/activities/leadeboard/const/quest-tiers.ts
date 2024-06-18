import { Rarity } from 'src/modules/core/models/items.model';

export const questTiers = [
  { maxQuests: 10, title: 'Scout', glow: 'common', rarity: Rarity.COMMON },
  {
    maxQuests: 50,
    title: 'Grunt',
    glow: 'common',
    rarity: Rarity.COMMON,
  },
  {
    maxQuests: 100,
    title: 'Brute',
    glow: 'uncommon',
    rarity: Rarity.UNCOMMON,
  },
  {
    maxQuests: 500,
    title: 'Marauder',
    glow: 'uncommon',
    rarity: Rarity.UNCOMMON,
  },
  { maxQuests: 1000, title: 'Warlord', glow: 'epic', rarity: Rarity.EPIC },
  { maxQuests: 2000, title: 'Chieftain', glow: 'epic', rarity: Rarity.EPIC },
  {
    maxQuests: 5000,
    title: 'Overlord',
    glow: 'legendary',
    rarity: Rarity.LEGENDARY,
  },
  {
    maxQuests: 10000,
    title: 'Warbringer',
    glow: 'mythic',
    rarity: Rarity.MYTHIC,
  },
  {
    maxQuests: Infinity,
    title: 'Godslayer',
    glow: 'highlight',
    rarity: Rarity.MYTHIC,
  },
];
