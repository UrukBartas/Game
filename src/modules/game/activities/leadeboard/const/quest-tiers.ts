import { Rarity } from 'src/modules/core/models/items.model';

export interface QuestTier {
  maxQuests: number;
  title: string;
  glow: string;
  rarity: Rarity;
  badge?: string;
  description?: string;
}

export const questTiers: QuestTier[] = [
  {
    maxQuests: 10,
    title: 'Scout',
    glow: 'common',
    rarity: Rarity.COMMON,
    badge: 'bi-shield',
    description: 'Just beginning their journey'
  },
  {
    maxQuests: 50,
    title: 'Grunt',
    glow: 'common',
    rarity: Rarity.COMMON,
    badge: 'bi-shield-fill',
    description: 'Proven their basic skills'
  },
  {
    maxQuests: 100,
    title: 'Brute',
    glow: 'uncommon',
    rarity: Rarity.UNCOMMON,
    badge: 'bi-shield-shaded',
    description: 'A formidable warrior'
  },
  {
    maxQuests: 500,
    title: 'Marauder',
    glow: 'uncommon',
    rarity: Rarity.UNCOMMON,
    badge: 'bi-shield-plus',
    description: 'Feared by many'
  },
  {
    maxQuests: 1000,
    title: 'Warlord',
    glow: 'epic',
    rarity: Rarity.EPIC,
    badge: 'bi-award',
    description: 'Commands respect on the battlefield'
  },
  {
    maxQuests: 2000,
    title: 'Chieftain',
    glow: 'epic',
    rarity: Rarity.EPIC,
    badge: 'bi-award-fill',
    description: 'Leader of the warband'
  },
  {
    maxQuests: 5000,
    title: 'Overlord',
    glow: 'legendary',
    rarity: Rarity.LEGENDARY,
    badge: 'bi-trophy',
    description: 'Master of conquest'
  },
  {
    maxQuests: 10000,
    title: 'Warbringer',
    glow: 'mythic',
    rarity: Rarity.MYTHIC,
    badge: 'bi-trophy-fill',
    description: 'Legend of the realm'
  },
  {
    maxQuests: Infinity,
    title: 'Godslayer',
    glow: 'highlight',
    rarity: Rarity.MYTHIC,
    badge: 'bi-stars',
    description: 'Transcended mortality'
  },
];
