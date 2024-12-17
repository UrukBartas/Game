import { Item } from './items.model';
import { MiscellanyItemData, MiscellanyItemIdentifier } from './misc.model';
import { QuestModel } from './quest.model';
import { SessionModel } from './session.model';

export type BoostType = 'EXP' | 'URUKS' | 'TRAVEL';

export interface PlayerModel {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  emailVerified: boolean;
  image: string;
  clazz: PlayerClass;
  level: number;
  experience: number;
  items: Array<Item>;
  sessions: SessionModel[];
  activeQuests: QuestModel[];
  boosts: BoostActive[];
  uruks: number;
  // Calculated stats with items
  stats: PlayerStatsModel;
  perStats?: TotalPerStats;
  sockets: number;
  mount?: MiscellanyItemData;
  activeSilhouette: string;
  title?: string;
  titles?: MiscellanyItemData[];
  activePrefixTitle: MiscellanyItemIdentifier;
  activeSuffixTitle: MiscellanyItemIdentifier;
  activeSkin: MiscellanyItemIdentifier;
  unlockedPortraitsIds: string[];
  // Base player stats
  health: number;
  damage: number;
  armor: number;
  speed: number;
  energy: number;
  //calculated based on quests
  pve?: { title: string; glow: string };
  pvpIndex?: number;
  mmr: number;
  finishedQuestsCount: number;
  configuration: PlayerConfiguration;
  remainingHealth?: number;
  remainingEnergy?: number;
}

export interface PlayerConfiguration {
  disablePVP: boolean;
  disableSound: boolean;
  ignoreMine: boolean;
  disableEmailNotifications: boolean;
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

export interface TotalPerStats {
  totalPerHealth: number;
  totalPerDamage: number;
  totalPerArmor: number;
  totalPerSpeed: number;
  totalPerEnergy: number;
  totalPerDodge: number;
  totalPerCrit: number;
  totalPerBlock: number;
  totalPerAccuracy: number;
  totalPerPenetration: number;
}

export enum DeedId {
  PLAYER_LEVEL_DEED = 'PLAYER_LEVEL_DEED',
  WON_PVP_BATTLES = 'WON_PVP_BATTLES',
  MASTER_OF_QUESTS = 'MASTER_OF_QUESTS',
  EXPLORER_OF_ADVENTURES = 'EXPLORER_OF_ADVENTURES',
  CONQUEROR_OF_CRYPTS = 'CONQUEROR_OF_CRYPTS',
  TIRELESS_WORKER = 'TIRELESS_WORKER',
  HERALD_OF_COMPANIONS = 'HERALD_OF_COMPANIONS',
}

export enum PlayerClass {
  WARLOCK = 'WARLOCK',
  MAGE = 'MAGE',
  ROGUE = 'ROGUE',
  WARRIOR = 'WARRIOR',
}

export interface DeedData {
  id: DeedId; // Usamos el enum DeedId como el id
  name: string; // Nombre del deed
  description: string; // Descripción del deed
  image: string; // Ruta de la imagen asociada al deed
  tier: number; // Nivel del deed
}

export interface Deed {
  id: number; // ID del registro del deed del jugador
  playerId: string; // ID del jugador que ha alcanzado el deed
  deedDataId: DeedId; // Referencia al ID del DeedData (enum DeedId)
  tier: number; // Nivel alcanzado por el jugador en este deed
  completed: boolean; // Si el deed ha sido completado
  deedData: DeedData; // Relación con DeedData (opcional, se incluye para los datos relacionados)
}

export interface ItemSet {
  id: number;
  name: string;
  items: Item[]; // Aquí va una lista de items, según cómo los tengas definidos
}

export interface BoostActive {
  id: number;
  playerId: string;
  player: PlayerModel;
  boostId: MiscellanyItemIdentifier;
  boostData: MiscellanyItemData;
  activatedAt: Date;
  expiresAt: Date;
  active: boolean;
  type: BoostType;
  mineBoost?: boolean;
}
