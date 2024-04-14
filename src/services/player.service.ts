import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { Item } from 'src/modules/core/models/items.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
import { RefreshPlayer } from 'src/store/main.store';

@Injectable({
  providedIn: 'root',
})
export class PlayerService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/player';
  }

  public async equipItemFlow(item: Item, onEquip?: Function) {
    try {
      this.spinnerService.show();
      await firstValueFrom(
        this.equipItem(item).pipe(
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

  create(email: string, name: string, image: string): Observable<PlayerModel> {
    return this.post('/create', { email, name, image });
  }

  update(email: string, name: string, image: string): Observable<PlayerModel> {
    return this.post('/update', { email, name, image });
  }

  getItems() {
    return this.get('/inventory');
  }
  getItemsSize() {
    return this.get('/inventory-size');
  }
  getItemsConsumable(): Observable<Array<Consumable>> {
    return this.get('/inventory-consumables');
  }

  getItemsDisabled() {
    return this.get('/inventory-disabled');
  }

  getNFTS() {
    return this.get('/get-nfts-items', true);
  }

  public unEquipItem(item: Item) {
    return this.post('/unequip/' + item.id, {}) as Observable<Item>;
  }

  public equipItem(item: Item) {
    return this.post('/equip/' + item.id, {}) as Observable<Item>;
  }

  public getLeaderboard(
    sortBy: string,
    sortType: 'asc' | 'desc',
    page: number,
    chunkSize: number,
    nameOrWallet: string
  ) {
    return this.post('/get-leaderboard/', {
      sortBy,
      sortType,
      page,
      chunkSize,
      nameOrWallet,
    }) as Observable<PlayerModel[]>;
  }

  public getPlayerByAddress(address: string) {
    return this.get('/by-address/' + address);
  }
}
