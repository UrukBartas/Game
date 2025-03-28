import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  FightModel,
  TurnActionEnum,
} from 'src/modules/core/models/fight.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
import { PVPHistoricModel } from 'src/modules/game/components/fight-historic/models/pvp-historic.model';

@Injectable({
  providedIn: 'root',
})
export class PvPFightService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/pvp';
  }

  // Métodos existentes
  getLastMatch(): Observable<PVPHistoricModel> {
    return this.get('/last-match');
  }

  getHistoric(
    address: string,
    limit: number,
    offset: number
  ): Observable<PVPHistoricModel[]> {
    return this.post('/historic', {
      address,
      limit,
      offset,
    });
  }

  /** AUTO */
  getAutoFight(): Observable<FightModel> {
    return this.get(`/auto`);
  }

  createAutoFight(opponentAddress: string): Observable<any> {
    return this.get(`/auto/create/${opponentAddress}`);
  }

  checkAutoFightAvailability(opponentAddress: string): Observable<Date> {
    return this.get(`/auto/check-timer/${opponentAddress}`);
  }

  actions(
    action: TurnActionEnum,
    consumableId: number
  ): Observable<FightModel> {
    if (consumableId) {
      return this.get(`/auto/action/${action}/${consumableId}`);
    } else {
      return this.get(`/auto/action/${action}`);
    }
  }

  surrender(): Observable<any> {
    return this.get(`/auto/surrender`);
  }

  // Nuevos métodos para acciones adicionales en PvP normal
  usePotion(consumableId: number): Observable<FightModel> {
    return this.get(`/additional-actions/use-potion/${consumableId}`);
  }

  getBonusActionsRemaining(): Observable<{ used: number, remaining: number, total: number }> {
    return this.get(`/additional-actions/bonus-actions-remaining`);
  }

  // Nuevos métodos para acciones adicionales en Auto-PvP
  useAutoPvPPotion(consumableId: number): Observable<FightModel> {
    return this.get(`/auto/additional-actions/use-potion/${consumableId}`);
  }

  getAutoPvPBonusActionsRemaining(): Observable<{ used: number, remaining: number, total: number }> {
    return this.get(`/auto/additional-actions/bonus-actions-remaining`);
  }
}