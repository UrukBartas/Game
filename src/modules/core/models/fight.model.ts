import { PlayerModel } from './player.model';

export interface FightModel {
  questId: number;
  player: PlayerModel;
  enemy: PlayerModel;
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
  ATTACK,
  MISS,
  BLOCK,
  CRIT,
  DEFEND,
}
