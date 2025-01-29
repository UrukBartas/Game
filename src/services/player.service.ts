import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, finalize, firstValueFrom, tap } from 'rxjs';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { Material } from 'src/modules/core/models/material.model';
import {
  MiscellanyItem,
  MiscellanyItemIdentifier,
} from 'src/modules/core/models/misc.model';
import {
  ItemSet,
  PlayerClass,
  PlayerConfiguration,
  PlayerModel,
} from 'src/modules/core/models/player.model';
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

  public getExtraAttemptPrice(): Observable<number> {
    return this.get('/crypt-attempt-price');
  }

  public getUpgradeCost(): Observable<{ cost: number }> {
    return this.get(`/cost`);
  }

  public getMultichainStakedAmount$(): Observable<number> {
    return this.get('/get-multichain-staked-amount');
  }

  public upgradeStat(stat: string): Observable<PlayerModel> {
    return this.post(`/upgrade/${stat}`, {});
  }

  public getPlayerDeeds(): Observable<{
    playerDeeds: Array<any>;
    allDeeds: Array<any>;
  }> {
    return this.get('/deeds');
  }

  public async equipItemFlow(equip$: Observable<any>, onEquip?: Function) {
    this.spinnerService.show();
    await firstValueFrom(
      equip$.pipe(
        tap(() => {
          this.store.dispatch(new RefreshPlayer());
          onEquip();
        }),
        finalize(() => {
          this.spinnerService.hide();
        })
      )
    );
  }

  create(
    email: string,
    name: string,
    clazz: PlayerClass,
    image: string,
    password: string,
    configuration: PlayerConfiguration
  ): Observable<PlayerModel> {
    return this.post('/create', {
      email,
      name,
      clazz,
      image,
      password,
      configuration,
    });
  }

  createByEmail(
    email: string,
    name: string,
    clazz: PlayerClass,
    image: string,
    password: string,
    configuration: PlayerConfiguration
  ): Observable<PlayerModel> {
    return this.post('/create-by-email', {
      email,
      name,
      clazz,
      image,
      password,
      configuration,
    });
  }

  update(
    email: string,
    password: string,
    configuration: PlayerConfiguration
  ): Observable<PlayerModel> {
    return this.post('/update', {
      email,
      password,
      configuration,
    });
  }

  updateClass(clazz: PlayerClass, skin: MiscellanyItemIdentifier) {
    return this.post('/update-class', {
      clazz,
      skin,
    });
  }

  migrateEta(address: string) {
    return this.get('/migrate-eta-account/' + address);
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

  getMiscellanyItems(): Observable<Array<MiscellanyItem>> {
    return this.get('/inventory-miscellany');
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

  public createItemSet(name: string, itemIds: number[]): Observable<ItemSet> {
    return this.post('/item-set/create', { name, itemIds });
  }

  public getItemSets(): Observable<ItemSet[]> {
    return this.get('/item-sets');
  }

  public updateItemSet(
    setId: number,
    name: string,
    itemIds: number[]
  ): Observable<ItemSet> {
    return this.post(`/item-set/update/${setId}`, { name, itemIds });
  }

  public equipItemSet(setId: number): Observable<any> {
    return this.get('/item-set/equip/' + setId);
  }

  public deleteItemSet(setId: number) {
    return this.delete('/item-set/' + setId);
  }

  public equipMount(mountId: number) {
    return this.get('/equip-mount/' + mountId);
  }
}
