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
    return this.get('/' + itemId + '/get-item/');
  }

  public destroyItem(itemId: number) {
    return this.post('/' + itemId + '/destroy-item/', {});
  }

  public getItemData(itemIdData: number) {
    return this.get('/' + itemIdData + '/get-item-data/');
  }

  public getMultipleItemsAtOnce(ids: { ids: Array<number> }) {
    return this.post('/get-multiple-at-once', ids);
  }

  public unEquipItem(item: Item) {
    return this.post('/' + item.id + '/unequip/', {}) as Observable<Item>;
  }

  public equipItem(item: Item) {
    return this.post('/' + item.id + '/equip/', {}) as Observable<Item>;
  }

  public upgradeItem(itemId: number) {
    return this.get('/' + itemId + '/upgrade-item/');
  }

  public getUpgradeItemPreview(itemId: number) {
    return this.get('/' + itemId + '/upgrade-item-preview/');
  }

  public recycleItem(itemId: number) {
    return this.get('/' + itemId + '/recycle-item/');
  }

  public getRecycleItemPreview(itemId: number) {
    return this.get('/' + itemId + '/recycle-item-preview/');
  }
}
