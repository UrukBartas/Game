import { QuestModel } from './quest.model';
import { Item } from './items.model';
import { SessionModel } from './session.model';

export interface PlayerModel {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  image: string;
  level: number;
  experience: number;
  health: number;
  energy: number;
  attack: number;
  defense: number;
  items: Array<Item>;
  sessions: SessionModel[];
  activeQuests: QuestModel[];
}
