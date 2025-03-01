import { BoardMission } from 'src/services/board-mission.service';
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
  uruksFactor?: number;
  exp?: number;
  expFactor?: number;
  completedAdventure?: boolean;
  ganked?: GankMonsters;
  isCrypt?: boolean;
  completedMissions?: Array<BoardMission>
}

export enum GankMonsters {
  Sasquatch = 'Sasquatch',
  Cyclops = 'Ciclop',
  Manticore = 'Manticora',
  Hydra = 'Hidra',
  Cerberus = 'Cerberus',
  Balrog = 'Balrog',
  Leviathan = 'Leviathan',
  Dragon = 'Dragon',
  Kraken = 'Kraken',
  Behemoth = 'Behemoth',
}

export const GankMonstersIds = [
  { monster: GankMonsters.Sasquatch, questId: 56 },
  { monster: GankMonsters.Cyclops, questId: 55 },
  { monster: GankMonsters.Manticore, questId: 58 },
  { monster: GankMonsters.Hydra, questId: 61 },
  { monster: GankMonsters.Cerberus, questId: 62 },
  { monster: GankMonsters.Balrog, questId: 59 },
  { monster: GankMonsters.Leviathan, questId: 60 },
  { monster: GankMonsters.Dragon, questId: 63 },
  { monster: GankMonsters.Kraken, questId: 64 },
  { monster: GankMonsters.Behemoth, questId: 57 },
];

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
