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
