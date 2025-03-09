import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MonsterType } from 'src/modules/core/models/quest-data.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
export enum BoardMissionType {
  HUNT = 'HUNT',
  GATHER = 'GATHER',
}

export enum BoardMissionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface MaterialReward {
  materialId: string;
  amount: number;
}

export interface BoardMission {
  id: number;
  title: string;
  description: string;
  type: BoardMissionType;
  difficulty: string;
  timeLimit: number;
  expiresAt: Date;
  monsterType?: MonsterType;
  materialId?: string;
  killCount?: number;
  gatherCount?: number;
  rewardUruks: number;
  rewardExperience: number;
  rewardMaterials: MaterialReward[];
}

export interface PlayerBoardMission {
  id: number;
  playerId: string;
  missionId: number;
  progress: number;
  status: BoardMissionStatus;
  completedAt?: Date;
  mission: BoardMission;
}
@Injectable({
  providedIn: 'root',
})
export class BoardMissionService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/board-mission';
  }

  public getActiveMissions(): Observable<BoardMission[]> {
    return this.get('/active');
  }

  public getPlayerMissions(): Observable<PlayerBoardMission[]> {
    return this.get('/player');
  }

  public acceptMission(missionId: number): Observable<PlayerBoardMission> {
    return this.post(`/${missionId}/accept`, {});
  }

  public getPlayerActiveMission(): Observable<PlayerBoardMission> {
    return this.get('/player/active');
  }

  public cancelMission(missionId: number): Observable<PlayerBoardMission> {
    return this.post(`/${missionId}/cancel`, {});
  }
}
