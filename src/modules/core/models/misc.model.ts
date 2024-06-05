import { Rarity } from './items.model';
import { PlayerModel } from './player.model';

export enum MiscellanyItemType {
  Lootbox = 'Lootbox',
  Recipe = 'Recipe',
}

export enum MiscellanyItemIdentifier {
  LootboxCommon = 'LootboxCommon',
  LootboxUncommon = 'LootboxUncommon',
  LootboxEpic = 'LootboxEpic',
  LootboxLegendary = 'LootboxLegendary',
  LootboxMythic = 'LootboxMythic',
  RecipeEnchant = 'RecipeEnchant',
}

// Interfaces
export interface MiscellanyItem {
  id: number;
  playerId?: string | null;
  player?: PlayerModel | null;
  miscellanyItemDataId: MiscellanyItemIdentifier;
  miscellanyItemData: MiscellanyItemData;
  extraData?: any | null; // JSON type, can be anything
}

export interface MiscellanyItemData {
  id: MiscellanyItemIdentifier;
  name: string;
  image: string;
  imageLocal?: string | null;
  rarity: Rarity;
  itemType: MiscellanyItemType;
  description: string;
  instances: MiscellanyItem[];
}
