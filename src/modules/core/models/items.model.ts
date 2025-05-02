import { ItemSetEnum, PlayerModel } from './player.model';

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
  item_rarity_stat?: number | null;

  equipped: boolean;
  enabled: boolean;
  durability?: number;
  price?: number;
  slotEquipped?: ItemType;

  canBeUpgraded?: boolean;
  souldBound: boolean;
  extraData?: any;
}

export enum DamageType {
  BLUDGEONING = 'BLUDGEONING',
  PIERCING = 'PIERCING',
  SLASHING = 'SLASHING',
  FIRE = 'FIRE',
  COLD = 'COLD',
  ELECTRIC = 'ELECTRIC',
  POISON = 'POISON',
  PSYCHIC = 'PSYCHIC',
  HOLY = 'HOLY',
  DARK = 'DARK',
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
  souldBoundByDefault: boolean;
  extraData?: any;
  set?: ItemSetEnum;
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

export enum ItemEdition {
  PRESALE = 'PRESALE',
}
