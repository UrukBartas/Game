import { QuestDataModel } from './quest-data.model';

export interface QuestModel {
  id: number;
  playerId: string;
  questId: number;
  level: number;
  data: QuestDataModel;
  startedAt: string;
  finishedAt: string;
  active: boolean;
  selected?: boolean;
}
