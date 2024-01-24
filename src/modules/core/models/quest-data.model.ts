import { RarityEnum } from './items.enum';

export interface QuestDataModel {
  id: number;
  name: string;
  description: string;
  enemy: string;
  enemyImage: string;
  image: string;
  level: number;
  rarity: RarityEnum;
}
