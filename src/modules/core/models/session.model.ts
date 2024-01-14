import { UserModel } from './user.model';

export interface SessionModel {
  id: number;
  token: string;
  createdAt: string;
  expiresAt: string | null;
  userId: string;
}
