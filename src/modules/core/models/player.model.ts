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
  items: Array<Item>;
  sessions: SessionModel[];
  activeQuests: QuestModel[];
  uruks: number;
  health: number;
  energy: number;
  damage: number;
  armor: number;
  speed: number;
  penetration?: number;
  dodge?: number;
  crit?: number;
  block?: number;
  accuracy?: number;
}
