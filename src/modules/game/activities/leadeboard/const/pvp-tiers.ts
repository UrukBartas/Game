import { Rarity } from 'src/modules/core/models/items.model';

export interface PvpTier {
  range: [number, number];
  title: string;
  rarity: Rarity;
  pvpTrophy?: string;
  pveTrophy?: string;
}

export const pvpTiers: PvpTier[] = [
  {
    range: [1, 1],
    title: 'Emperor of the Hordes',
    rarity: Rarity.MYTHIC,
  },
  {
    range: [2, 2],
    title: 'Supreme Warchief',
    rarity: Rarity.LEGENDARY,
  },
  {
    range: [3, 3],
    title: 'Dread Overlord',
    rarity: Rarity.LEGENDARY,
  },
  {
    range: [4, 4],
    title: 'High Warlord',
    rarity: Rarity.EPIC,
  },
  {
    range: [5, 5],
    title: 'Shadow Chieftain',
    rarity: Rarity.EPIC,
  },
  {
    range: [6, 10],
    title: 'Warlord',
    rarity: Rarity.UNCOMMON,
  },
  {
    range: [11, Infinity],
    title: 'Brute',
    rarity: Rarity.COMMON,
  },
];
