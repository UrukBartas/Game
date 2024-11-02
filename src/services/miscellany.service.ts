import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Item } from 'src/modules/core/models/items.model';
import { MaterialData } from 'src/modules/core/models/material.model';
import {
  MiscellanyItemData,
  MiscellanyItemIdentifier,
} from 'src/modules/core/models/misc.model';
import { ApiBaseService } from '../modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class MiscellanyService extends ApiBaseService {
  public poolPortraits: Array<MiscellanyItemData> = [];
  public poolMaterials: Array<MaterialData> = [];
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/miscellany';
    this.getAllPortraits()
      .pipe(takeUntilDestroyed())
      .subscribe((data) => (this.poolPortraits = data));

    this.getAllMaterials()
      .pipe(takeUntilDestroyed())
      .subscribe((data) => (this.poolMaterials = data));
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

  public getAllPortraits(): Observable<MiscellanyItemData[]> {
    return this.get('/all-portraits');
  }

  public getAllMaterials(): Observable<MaterialData[]> {
    return this.get('/all-materials');
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

  public setSkin(id: MiscellanyItemIdentifier) {
    return this.get('/set-skin/' + id);
  }
}
