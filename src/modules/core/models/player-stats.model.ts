import { BuffModel } from './fight-buff.model';

export interface FighterStats {
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
  buffs?: BuffModel[];
}
