import { Rarity } from 'src/modules/core/models/items.model';

export interface LootboxPresaleModel {
  name: string;
  image: string;
  rarity: Rarity;
  total: number;
  avaible?: number;
  price?: string;
}
