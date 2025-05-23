import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  FightModel,
  TurnActionEnum,
} from 'src/modules/core/models/fight.model';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class FightService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/fight';
  }

  // Métodos existentes
  actions(
    action: TurnActionEnum,
    consumableId: number
  ): Observable<FightModel> {
    if (consumableId) {
      return this.get(`/action/${action}/${consumableId}`);
    } else {
      return this.get(`/action/${action}`);
    }
  }

  surrender(): Observable<QuestModel> {
    return this.get(`/surrender`);
  }

  consumables(): Observable<any> {
    return this.get(`/consumables`);
  }

  // Nuevos métodos para acciones adicionales
  usePotion(consumableId: number): Observable<FightModel> {
    return this.get(`/additional-actions/use-potion/${consumableId}`);
  }

  getBonusActionsRemaining(): Observable<{ used: number, remaining: number, total: number }> {
    return this.get(`/additional-actions/bonus-actions-remaining`);
  }
}
