import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MiscellanyItemType } from 'src/modules/core/models/misc.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class StatsService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/stats';
  }

  lootboxRrarityDistributions(type: MiscellanyItemType): Observable<any> {
    return this.get(`/lootbox-rarity-distributions/${type}`);
  }

  lootboxPossibilities(type: MiscellanyItemType): Observable<any> {
    return this.get(`/lootbox-drop-rate/${type}`);
  }

  getCappedStats(): Observable<any> {
    return this.get('/capped-stats');
  }

  getCappedPerStats(): Observable<any> {
    return this.get('/capped-per-stats');
  }

  getDamageEffectiveness(): Observable<any> {
    return this.get('/damage-effectiveness');
  }

  getMonsterWeakness(): Observable<any> {
    return this.get('/creature-weakness');
  }
}
