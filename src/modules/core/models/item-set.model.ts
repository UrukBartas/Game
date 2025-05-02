import { ItemSetPassive } from './item-set-passive.model';

export interface ItemSetData {
  id: string;
  name: string;
  description: string;
  stages: {
    pieces: number;
    bonusStats?: {
      [stat: string]: number;
    };
    bonusPassive?: ItemSetPassive;
  }[];
}