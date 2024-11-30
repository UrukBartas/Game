import { PlayerModel } from 'src/modules/core/models/player.model';

export interface PVPHistoricModel {
  id: number;
  date: Date;
  player: PlayerModel;
  opponent: PlayerModel;
  opponentMMR: number;
  playerMMR: number;
  mmrChange: number;
  win: boolean;
  auto: boolean;
}
