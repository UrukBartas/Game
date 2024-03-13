export enum BuffType {
  CHARGE,
  FURY_POTION,
  ENERGY_POTION,
  ARMOR_POTION,
}

export interface BuffModel {
  type: BuffType;
  remainingTurns?: number;
}
