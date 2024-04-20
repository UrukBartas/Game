import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from 'src/modules/core/models/items.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class ItemService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/item';
  }

  public getItem(itemId: number) {
    return this.get('/get-item/' + itemId);
  }

  public destroyItem(itemId: number) {
    return this.post('/destroy-item/' + itemId, {});
  }

  public getItemData(itemIdData: number) {
    return this.get('/get-item-data/' + itemIdData);
  }

  public getMultipleItemsAtOnce(ids: { ids: Array<number> }) {
    return this.post('/get-multiple-at-once', ids);
  }

  public unEquipItem(item: Item) {
    return this.post('/unequip/' + item.id, {}) as Observable<Item>;
  }

  public equipItem(item: Item) {
    return this.post('/equip/' + item.id, {}) as Observable<Item>;
  }

  public upgradeItem(itemId: number) {
    return this.get('/upgrade-item/' + itemId);
  }

  public getUpgradeItemPreview(itemId: number) {
    return this.get('/upgrade-item-preview/' + itemId);
  }

  public recycleItem(itemId: number) {
    return this.get('/recycle-item/' + itemId);
  }

  public getRecycleItemPreview(itemId: number) {
    return this.get('/recycle-item-preview/' + itemId);
  }
}
