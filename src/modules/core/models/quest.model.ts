import { RarityEnum } from './items.enum';

export interface QuestModel {
  id: number;
  userId: string;
  name: string;
  description: string;
  image: string;
  level: number;
  rarity: RarityEnum;
  startedAt: string;
  finishedAt: string;
  completed: boolean;
  claimed: boolean;
}
