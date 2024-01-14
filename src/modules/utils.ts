import { RarityEnum } from './core/models/items.enum';

export function getRarityColor(rarity: RarityEnum): string {
  switch (rarity) {
    default:
    case RarityEnum.COMMON:
      return 'grey';
    case RarityEnum.UNCOMMON:
      return 'blue';
    case RarityEnum.EPIC:
      return 'purple';
    case RarityEnum.LEGENDARY:
      return 'orange';
    case RarityEnum.MYTHIC:
      return 'red';
  }
}
