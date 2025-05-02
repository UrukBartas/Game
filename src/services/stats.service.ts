import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClassPassive } from 'src/modules/core/models/class-passive.model';
import { ItemSetPassive } from 'src/modules/core/models/item-set-passive.model';
import { ItemSetData } from 'src/modules/core/models/item-set.model';
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

  getDurabilityByRarity(): Observable<any> {
    return this.get('/durability-by-rarity');
  }

  getMineTiers(): Observable<Array<any>> {
    return this.get('/stake-tiers');
  }

  getItemSets(): Observable<ItemSetData[]> {
    return this.get('/item-sets');
  }

  getItemSetPassives(): Observable<Record<string, ItemSetPassive>> {
    return this.get('/item-set-passives');
  }

  getClassPassives(): Observable<Record<string, ClassPassive>> {
    return this.get('/class-passives');
  }
}
