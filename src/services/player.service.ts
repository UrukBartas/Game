import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { Item } from 'src/modules/core/models/items.model';
import { Material } from 'src/modules/core/models/material.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
import { RefreshPlayer } from 'src/store/main.store';
import { ItemService } from './item.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService extends ApiBaseService {
  constructor(
    private http: HttpClient,
    private itemService: ItemService
  ) {
    super(http);
    this.controllerPrefix = '/player';
  }

  public async equipItemFlow(item: Item, onEquip?: Function) {
    try {
      this.spinnerService.show();
      await firstValueFrom(
        this.itemService.equipItem(item).pipe(
          tap(() => {
            this.store.dispatch(new RefreshPlayer());
            onEquip();
          })
        )
      );
      this.spinnerService.hide();
    } catch (error) {
      this.spinnerService.hide();
    }
  }

  create(
    email: string,
    name: string,
    image: string,
    password: string
  ): Observable<PlayerModel> {
    return this.post('/create', { email, name, image, password });
  }

  createByEmail(
    email: string,
    name: string,
    image: string,
    password: string
  ): Observable<PlayerModel> {
    return this.post('/create-by-email', { email, name, image, password });
  }

  update(
    email: string,
    name: string,
    image: string,
    password: string
  ): Observable<PlayerModel> {
    return this.post('/update', { email, name, image, password });
  }

  migrateEta(address: string) {
    return this.get('/migrate-eta-account/' + address);
  }

  getItems() {
    return this.get('/inventory');
  }

  getItemsBlacksmith() {
    return this.get('/blacksmith-inventory');
  }

  getItemsSize() {
    return this.get('/inventory-size');
  }

  getItemsConsumable(): Observable<Array<Consumable>> {
    return this.get('/inventory-consumables');
  }
  updateFCMToken(fcmToken: string) {
    return this.post('/add-fcm-token', { fcmToken });
  }

  getItemsMaterial(): Observable<Array<Material>> {
    return this.get('/inventory-materials');
  }

  getItemsDisabled() {
    return this.get('/inventory-disabled');
  }

  getNFTS() {
    return this.get('/get-nfts-items', true);
  }

  public getLeaderboard(
    sortBy: string,
    sortType: 'asc' | 'desc',
    page: number,
    chunkSize: number,
    nameOrWallet: string,
    from: Date,
    to: Date
  ) {
    return this.post('/get-leaderboard/', {
      sortBy,
      sortType,
      page,
      chunkSize,
      nameOrWallet,
      from: from.toISOString(),
      to: to.toISOString(),
    }) as Observable<PlayerModel[]>;
  }

  public getPlayerByAddress(address: string) {
    return this.get('/by-address/' + address);
  }
}
