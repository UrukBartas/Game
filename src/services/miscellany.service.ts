import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from 'src/modules/core/models/items.model';
import {
  MiscellanyItemData,
  MiscellanyItemIdentifier,
} from 'src/modules/core/models/misc.model';
import { ApiBaseService } from '../modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class MiscellanyService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/miscellany';
  }

  public getPresaleBoxes() {
    return this.get('/presale-boxes');
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

  public activateSilhouette(silhouetteId: number): Observable<void> {
    return this.get('/active-silhouette/' + silhouetteId);
  }

  public activateTitle(titleId: number): Observable<void> {
    return this.get('/active-title/' + titleId);
  }

  public activateBoost(boostId: number): Observable<void> {
    return this.get('/active-boost/' + boostId);
  }

  public getPremiumPortraits(): Observable<MiscellanyItemData[]> {
    return this.get('/premium-portraits');
  }

  public getSilhouettes(): Observable<MiscellanyItemData[]> {
    return this.get('/silhouettes');
  }

  public setSilhouette(idSilouette: MiscellanyItemIdentifier) {
    return this.get('/set-silhouette/' + idSilouette);
  }
  public setTitle(
    type: 'Title_Prefix' | 'Title_Suffix',
    id: MiscellanyItemIdentifier
  ) {
    return this.get('/set-title/' + type + '/' + id);
  }
}
