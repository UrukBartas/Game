export enum BuffType {
  CHARGE,
  FURY_POTION,
  ENERGY_POTION,
  ARMOR_POTION,
  SPEED_POTION,
  PENETRATION_POTION,
  CRIT_POTION,
  DODGE_POTION,
  BLOCK_POTION,
  ACCURACY_POTION,
}

export interface BuffModel {
  type: BuffType;
  remainingTurns?: number;
}
