import { AdventureData } from 'src/services/adventures-data.service';
import { QuestDataModel } from './quest-data.model';
import { Adventure } from 'src/services/adventures.service';

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
}
