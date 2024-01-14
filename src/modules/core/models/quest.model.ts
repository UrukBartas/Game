import { RarityEnum } from './items.enum';

export interface ActiveQuestModel {
  id: number;
  userId: string;
  name: string;
  level: string;
  rarity: RarityEnum;
  startedAt: string;
  finishedAt: string | null;
  completed: boolean;
  claimed: boolean;
}
