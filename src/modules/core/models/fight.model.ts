import { Consumable } from './consumable.model';
import { Item } from './items.model';
import { Material } from './material.model';
import { MiscellanyItem } from './misc.model';
import { FighterStats } from './player-stats.model';
import { PlayerModel } from './player.model';
import { QuestModel } from './quest.model';

export interface FightModel {
  questId: number;
  playerId: string;
  playersData?: FightDataModel;
  baseStats: FightStatsModel;
  currentStats: FightStatsModel;
  turns: FightTurnModel[];
  result: FightResultModel;
}

export interface FightStatsModel {
  player: FighterStats;
  enemy: FighterStats;
}

export interface FightDataModel {
  player: PlayerModel;
  enemy: PlayerModel;
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
  loot?: Array<Item>;
  lostLoot?: Array<Item>;
  consumableLoot?: Array<Consumable>;
  consumableLostLoot?: Array<Consumable>;
  materialLoot?: Array<Material>;
  materialLostLoot?: Array<Material>;
  miscellanyLoot?: Array<MiscellanyItem>;
  miscellanyLostLoot?: Array<MiscellanyItem>;
  material?: Material;
  player?: PlayerModel;
  uruks?: number;
  completedAdventure?: boolean;
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
