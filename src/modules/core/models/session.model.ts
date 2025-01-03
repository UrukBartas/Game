export interface SessionModel {
  id: number;
  token: string;
  createdAt: string;
  expiresAt: string | null;
  playerId: string;
  loginWithMail: boolean;
}

export interface Realm {
  id: string;
  name: string;
  url: string;
  icon: string;
}
