import { PlayerModel } from './player.model';

export interface SessionModel {
  id: number;
  token: string;
  createdAt: string;
  expiresAt: string | null;
  playerId: string;
  loginWithMail: boolean;
}
