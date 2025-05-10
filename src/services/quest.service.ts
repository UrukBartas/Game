import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { FightModel, GankMonsters } from 'src/modules/core/models/fight.model';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
import { SetQuests } from 'src/store/main.store';

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

  startGank(questId: number, monster: GankMonsters): Observable<QuestModel> {
    return this.get('/' + questId + '/start-gank/' + monster);
  }

  resolve(questId: number): Observable<FightModel> {
    return this.get('/' + questId + '/resolve');
  }

  claim(): Observable<void> {
    return this.get('/claim');
  }

  public roll() {
    return this.get('/roll');
  }

  public rollData(): Observable<{
    price: number;
    rollNumber: number;
  }> {
    return this.get('/roll-data');
  }

  async updateStore() {
    const quests = await firstValueFrom(this.getActive());
    this.store.dispatch(new SetQuests(quests));
  }

}
