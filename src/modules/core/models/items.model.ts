import { PlayerModel } from './player.model';

export interface Item {
  id: number;
  level: number;

  playerId?: string;
  player?: PlayerModel | null;
  itemDataId: number;
  itemData: ItemData;

  health?: number | null;
  damage?: number | null;
  armor?: number | null;
  penetration?: number | null;
  speed?: number | null;
  energy?: number | null;
  dodge?: number | null;
  crit?: number | null;
  block?: number | null;
  accuracy?: number | null;

  equipped: boolean;
  enabled: boolean;
}

interface ItemData {
  id: number;
  name: string;
  image: string;
  rarity: Rarity;
  itemType: ItemType;
  trait?: Trait | null;

  items: Item[];
}

export enum ItemType {
  Helmet = 'Helmet',
  Chest = 'Chest',
  Gloves = 'Gloves',
  Trousers = 'Trousers',
  Boots = 'Boots',
  Weapon = 'Weapon',
  Shield = 'Shield',
  Ring = 'Ring',
  Charm = 'Charm',
}

export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC',
}

export enum Trait {
  HOLY = 'HOLY',
  INFERNAL = 'INFERNAL',
  CORROSION = 'CORROSION',
}
