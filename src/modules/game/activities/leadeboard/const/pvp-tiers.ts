import { Rarity } from 'src/modules/core/models/items.model';

export interface PvpTier {
  range: [number, number];
  title: string;
  rarity: Rarity;
  badge: string;
  description?: string;
}

export const pvpTiers: PvpTier[] = [
  {
    range: [1, 1],
    title: 'Emperor of the Hordes',
    rarity: Rarity.MYTHIC,
    badge: 'bi-stars',
    description: 'The undisputed champion of the arena'
  },
  {
    range: [2, 2],
    title: 'Supreme Warchief',
    rarity: Rarity.LEGENDARY,
    badge: 'bi-trophy-fill',
    description: 'A legendary fighter feared by all'
  },
  {
    range: [3, 3],
    title: 'Dread Overlord',
    rarity: Rarity.LEGENDARY,
    badge: 'bi-trophy',
    description: 'Commands respect through sheer power'
  },
  {
    range: [4, 4],
    title: 'High Warlord',
    rarity: Rarity.EPIC,
    badge: 'bi-award-fill',
    description: 'Elite warrior with exceptional skill'
  },
  {
    range: [5, 5],
    title: 'Shadow Chieftain',
    rarity: Rarity.EPIC,
    badge: 'bi-award',
    description: 'Tactical genius in combat'
  },
  {
    range: [6, 10],
    title: 'Warlord',
    rarity: Rarity.UNCOMMON,
    badge: 'bi-shield-plus',
    description: 'Rising through the ranks with determination'
  },
  {
    range: [11, Infinity],
    title: 'Brute',
    rarity: Rarity.COMMON,
    badge: 'bi-shield-fill',
    description: 'Beginning their journey in the arena'
  },
];
