import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  FightModel,
  TurnActionEnum,
} from 'src/modules/core/models/fight.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class FightService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/fight';
  }

  start(): Observable<FightModel> {
    return this.get('/start');
  }

  actions(action: TurnActionEnum): Observable<FightModel> {
    return this.get(`/action/${action}`);
  }
}
