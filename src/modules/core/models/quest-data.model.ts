import { Rarity } from './items.model';

export interface QuestDataModel {
  id: number;
  name: string;
  description: string;
  image: string;
  enemy: string;
  enemyImage: string;
  level: number;
  rarity: Rarity;
  isAdventurePhase?: boolean;
}
