import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
import { AdventureData } from './adventures-data.service';

export interface Adventure {
  id: number;
  currentPhase: number;
  startedAt?: Date;
  finishedAt?: Date;
  completed: boolean;
  playerId: string;
  player: PlayerModel;
  adventureDataId: number;
  data: AdventureData;
  quests: QuestModel[];
}
@Injectable({
  providedIn: 'root',
})
export class AdventuresService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
    this.controllerPrefix = '/adventure';
  }

  public startAdventure(adventureDataId: number) {
    return this.get('/' + adventureDataId + '/start') as Observable<Adventure>;
  }

  public unstuckAdventure(adventureDataId: number) {
    return this.get(
      '/' + adventureDataId + '/unstuck'
    ) as Observable<Adventure>;
  }
}
