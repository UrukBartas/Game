import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { Item } from 'src/modules/core/models/items.model';
import { Material } from 'src/modules/core/models/material.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/player';
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
