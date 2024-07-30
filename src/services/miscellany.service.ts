import { Injectable } from '@angular/core';
import { ApiBaseService } from '../modules/core/services/api-base.service';
import { HttpClient } from '@angular/common/http';
import { Item } from 'src/modules/core/models/items.model';
import { Observable } from 'rxjs';
import { MiscellanyItemData } from 'src/modules/core/models/misc.model';

@Injectable({
  providedIn: 'root',
})
export class MiscellanyService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/miscellany';
  }

  public openLootbox(lootboxId: number): Observable<{
    spinWheelItems: Array<Item>;
    resultItem: Item;
    bonusDrops: Array<any>;
  }> {
    return this.get('/open-lootbox/' + lootboxId);
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
