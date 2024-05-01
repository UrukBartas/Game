import { Item } from './items.model';
import { Material } from './material.model';
import { FighterStats } from './player-stats.model';
import { PlayerModel } from './player.model';
import { QuestModel } from './quest.model';

export interface FightModel {
  questId: number;
  playerId: string;
  baseStats: FightStatsModel;
  currentStats: FightStatsModel;
  turns: FightTurnModel[];
  result: FightResultModel;
}

export interface FightStatsModel {
  player: FighterStats;
  enemy: FighterStats;
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
  newQuest: QuestModel;
  exp?: number;
  item?: Item;
  lostItem?: boolean;
  material?: Material;
  player?: PlayerModel;
  uruks?: number;
}

export interface FighterTurnModel {
  action: TurnActionEnum;
  damage: number;
}

export enum TurnActionEnum {
  ATTACK = 'attack',
  MISS = 'miss',
  BLOCKED = 'blocked',
  CRIT = 'crit',
  DEFEND = 'defend',
  USE_ITEM = 'use-item',
  CHARGE = 'charge',
}
