import { QuestDataModel } from './quest-data.model';

export interface QuestModel {
  id: number;
  playerId: string;
  questId: number;
  level: number;
  data: QuestDataModel;
  startedAt: string;
  finishedAt: string;
  completed: boolean;
  claimed: boolean;
  selected?: boolean;
}
