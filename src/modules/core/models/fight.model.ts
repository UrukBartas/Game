import { PlayerStatsModel } from './player-stats.model';

export interface FightModel {
  questId: number;
  playerId: string;
  playerStats: PlayerStatsModel;
  enemyStats: PlayerStatsModel;
  turns: FightTurnModel[];
}

export interface FightTurnModel {
  playerStatus: FighterStatusModel;
  enemyStatus: FighterStatusModel;
  playerTurn: FighterTurnModel;
  enemyTurn: FighterTurnModel;
}

export interface FighterStatusModel {
  health: number;
  energy: number;
}

export interface FighterTurnModel {
  action: TurnActionEnum;
  damage: number;
}

export enum TurnActionEnum {
  ATTACK = 'attack',
  MISS = 'miss',
  BLOCK = 'block',
  CRIT = 'crit',
  DEFEND = 'defend',
}
