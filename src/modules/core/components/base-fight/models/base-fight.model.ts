import {
  FightResultModel,
  FightTurnModel,
  FighterTurnModel,
} from 'src/modules/core/models/fight.model';
import { FighterStats } from 'src/modules/core/models/player-stats.model';

export enum FightTypes {
  QUEST = 'quest',
  PVP = 'pvp',
  AUTOPVP = 'autopvp',
  CRYPT = 'crypt',
}

export interface BaseFightModel {
  load: boolean;
  fightId: string;
  player: BaseFighterModel;
  enemy: BaseFighterModel;
  turns: FightTurnModel[];
  result?: FightResultModel;
  buffUpdateOnly?: boolean;
}

export interface BaseFighterModel {
  name: string;
  image: string;
  level: number;
  iri: number;
  title: string;
  baseStats: FighterStats;
  currentStats: FighterStats;
  lastTurn: FighterTurnModel;
}
