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
  // Calculated stats with items
  stats: PlayerStatsModel;
  sockets: number;

  // Base player stats
  health: number;
  damage: number;
  armor: number;
  speed: number;
  energy: number;
  //calculated based on quests
  pve?: { title: string; glow: string };
}

export interface PlayerStatsModel {
  health: number;
  damage: number;
  energy: number;
  speed: number;
  armor: number;
  block: number;
  penetration: number;
  crit: number;
  accuracy: number;
  dodge: number;
}
