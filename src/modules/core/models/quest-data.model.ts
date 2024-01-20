import { RarityEnum } from './items.enum';

export interface QuestDataModel {
  id: number;
  name: string;
  description: string;
  image: string;
  level: number;
  rarity: RarityEnum;
}
