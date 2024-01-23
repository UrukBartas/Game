import { RarityEnum, TraitsEnum } from './items.enum';
import { PlayerModel } from './player.model';

// Base interface for all items
interface BaseItemModel {
  id: number;
  name: string;
  image: string;
  rarity: RarityEnum;
  level: number;
  playerId: string | null;
}

export interface HelmetModel extends BaseItemModel {
  armor: number;
  health: number;
  accuracy: number;
  trait?: TraitsEnum | null;
}

export interface ChestModel extends BaseItemModel {
  armor: number;
  health: number;
  trait?: TraitsEnum | null;
}

export interface GlovesModel extends BaseItemModel {
  armor: number;
  health: number;
  accuracy: number;
  crit: number;
  trait?: TraitsEnum | null;
}

export interface TrousersModel extends BaseItemModel {
  armor: number;
  health: number;
  trait?: TraitsEnum | null;
}

export interface BootsModel extends BaseItemModel {
  armor: number;
  health: number;
  speed: number;
  dodge: number;
  trait?: TraitsEnum | null;
}

export interface WeaponModel extends BaseItemModel {
  damage: number;
  accuracy: number;
  speed: number;
  crit: number;
  penetration: number;
  trait?: TraitsEnum | null;
}

export interface ShieldModel extends BaseItemModel {
  armor: number;
  health: number;
  block: number;
  trait?: TraitsEnum | null;
}

export interface RingModel extends BaseItemModel {
  health: number;
  trait?: TraitsEnum | null;
}

export interface TotemModel extends BaseItemModel {
  damage: number;
  health: number;
  trait?: TraitsEnum | null;
}
