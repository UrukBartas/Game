import { RarityEnum } from './core/models/items.enum';

export function getRarityColor(rarity: RarityEnum): string {
  switch (rarity) {
    default:
    case RarityEnum.COMMON:
      return '#B0B5B3';
    case RarityEnum.UNCOMMON:
      return '#3D74B8';
    case RarityEnum.EPIC:
      return '#9D44B5';
    case RarityEnum.LEGENDARY:
      return '#FF7F11';
    case RarityEnum.MYTHIC:
      return '#F34213';
  }
}

export function calculateXPForLevel(level: number): number {
  const baseXP = 10; // XP required for the first level
  const multiplier = 1.05; // Exponential growth factor
  return Math.round(baseXP * Math.pow(multiplier, level - 1));
}
