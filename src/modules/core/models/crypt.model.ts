import { PlayerModel } from './player.model';
import { QuestDataModel } from './quest-data.model';

export enum CryptStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PICKING_REWARDS = 'PICKING_REWARDS',
  STARTING = 'STARTING',
}

export enum EncounterStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  FIGHTING = 'FIGHTING',
}

export interface CryptModel {
  id: number;
  playerId: string; // The ID of the player associated with the crypt
  weekStart: string; // Start date of the crypt's associated week (ISO format)
  status: CryptStatus; // Current status of the crypt
  currentLevel: number; // The current level reached in the crypt
  playerState: PlayerModel; // The saved state of the player during the crypt
  encounters: CryptEncounterModel[]; // List of encounters in the crypt
  createdAt: string; // Timestamp when the crypt was created
  updatedAt: string; // Timestamp of the last update to the crypt
  appliedBonuses: { rewards: Array<any> };
}

export interface CryptEncounterModel {
  id: number;
  cryptId: number; // ID of the associated crypt
  questId: number; // ID of the quest associated with this encounter
  levelFactor: number; // Difficulty level of the encounter
  status: EncounterStatus; // Status of the encounter
  questData?: QuestDataModel;
  difficultyLevel?: number;
}

export enum CryptStatusEnum {
  STARTING = 'STARTING',
  PICKING_REWARD = 'PICKING_REWARD', // El jugador elige una recompensa
  IN_PROGRESS = 'IN_PROGRESS', // La crypta está activa
  FIGHT = 'FIGHT', // Un encuentro activo
  RESULT = 'RESULT', // Mostrando resultados tras el combate
  FINISHED = 'FINISHED', // Crypta completada
  FAILED = 'FAILED',
}

export interface CryptRouterModel {
  status: CryptStatusEnum; // Estado actual
  data?: any; // Datos relevantes para el estado actual (encuentro, recompensa, etc.)
}
