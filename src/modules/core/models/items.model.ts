import { PlayerModel } from './player.model';

export interface Item {
  id: number;
  level: number;
  upgradeLevel: number;

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
  price?: number;
  slotEquipped?: ItemType;

  canBeUpgraded?: boolean;
}

export enum DamageType {
  BLUDGEONING = 'BLUDGEONING',
  PIERCING = 'PIERCING',
  SLASHING = 'SLASHING',
  FIRE = 'FIRE',
  COLD = 'COLD',
  LIGHTNING = 'LIGHTNING',
  THUNDER = 'THUNDER',
  ACID = 'ACID',
  POISON = 'POISON',
  PSYCHIC = 'PSYCHIC',
  RADIANT = 'RADIANT',
  NECROTIC = 'NECROTIC',
  FORCE = 'FORCE',
}

export interface ItemData {
  id: number;
  name: string;
  image: string;
  imageLocal: string;
  rarity: Rarity;
  itemType: ItemType;
  damageType: DamageType;
  trait?: Trait | null;
  description: string;
  items: Item[];
}

export enum ItemType {
  HELMET = 'Helmet',
  CHEST = 'Chest',
  GLOVES = 'Gloves',
  TROUSERS = 'Trousers',
  BOOTS = 'Boots',
  Weapon1H = 'Weapon1H',
  Weapon2H = 'Weapon2H',
  SHIELD = 'Shield',
  RING = 'Ring',
  CHARM = 'Charm',
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
