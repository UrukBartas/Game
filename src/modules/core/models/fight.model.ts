import { Item } from './items.model';
import { PlayerStatsModel } from './player-stats.model';
import { PlayerModel } from './player.model';
import { QuestModel } from './quest.model';

export interface FightModel {
  questId: number;
  playerId: string;
  playerStats: PlayerStatsModel;
  enemyStats: PlayerStatsModel;
  turns: FightTurnModel[];
  result: FightResultModel;
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

export interface FightResultModel {
  exp: number;
  loot: Item;
  player: PlayerModel;
  newQuest: QuestModel;
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
