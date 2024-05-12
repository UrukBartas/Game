import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FightModel } from 'src/modules/core/models/fight.model';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class QuestService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/quest';
  }

  getActive(): Observable<QuestModel[]> {
    return this.get('/');
  }

  start(questId: number): Observable<QuestModel> {
    return this.get('/' + questId + '/start');
  }

  resolve(questId: number): Observable<FightModel> {
    return this.get('/' + questId + '/resolve');
  }

  claim(): Observable<void> {
    return this.get('/claim');
  }
}
