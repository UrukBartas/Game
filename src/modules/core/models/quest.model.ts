import { Adventure } from 'src/services/adventures.service';
import { QuestDataModel } from './quest-data.model';

export interface QuestModel {
  id: number;
  playerId: string;
  questId: number;
  level: number;
  data: QuestDataModel;
  adventures?: Adventure[];
  startedAt: string;
  finishedAt: string;
  active: boolean;
  selected?: boolean;
  type: 'DEFAULT' | 'CRYPT';
}
