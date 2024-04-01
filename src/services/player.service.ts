import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from 'src/modules/core/models/items.model';
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
