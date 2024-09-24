import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from 'src/modules/core/models/items.model';
import { MiscellanyItemData } from 'src/modules/core/models/misc.model';
import { ApiBaseService } from '../modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class MiscellanyService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/miscellany';
  }

  public openLootbox(
    lootboxId: number,
    amount = 1
  ): Observable<
    Array<{
      spinWheelItems: Array<Item>;
      resultItem: Item;
      bonusDrops: Array<any>;
    }>
  > {
    return this.get('/open-lootbox/' + lootboxId + '/' + amount);
  }

  public openMoneyBag(moneyBagId: number): Observable<{}> {
    return this.get('/open-money-bag/' + moneyBagId);
  }

  public openItemsSet(itemsSetId: number): Observable<Array<Item>> {
    return this.get('/open-items-set/' + itemsSetId);
  }

  public activatePortrait(portraitId: number): Observable<void> {
    return this.get('/active-portrait/' + portraitId);
  }

  public getPremiumPortraits(): Observable<MiscellanyItemData[]> {
    return this.get('/premium-portraits');
  }
}
