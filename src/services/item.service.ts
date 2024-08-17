import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Item, ItemType, Rarity } from 'src/modules/core/models/items.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
import { ItemTypeSC } from 'src/modules/game/activities/export-import-nft/enums/ItemTypesSC';

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

  public getMultipleItemsAtOnce(ids: {
    ids: Array<number>;
    itemTypes: Array<ItemTypeSC>;
  }): Observable<any[]> {
    return this.post('/get-multiple-at-once', ids);
  }

  public unEquipItem(item: Item) {
    return this.post('/' + item.id + '/unequip/', {}) as Observable<Item>;
  }

  public equipItem(item: Item, equipType: ItemType) {
    return this.post(
      '/' + item.id + '/equip/' + equipType,
      {}
    ) as Observable<Item>;
  }

  public upgradeItem(itemId: number, useMagicDust: boolean) {
    return this.get('/' + itemId + '/upgrade-item/' + useMagicDust);
  }

  public getUpgradeItemPreview(itemId: number) {
    return this.get('/' + itemId + '/upgrade-item-preview/');
  }

  public recycleItems(itemIds: Array<number>) {
    return this.post('/recycle-items/', { ids: itemIds });
  }

  public getRecycleItemsPreview(itemsIds: Array<number>) {
    return this.post('/recycle-items-preview/', { ids: itemsIds });
  }

  public getRecipes(itemId: number) {
    return this.get('/recipes-for-item/' + itemId);
  }

  public getPreviewForRecipe(itemId: number, recipeId: number) {
    return this.get(`/preview-for-recipe/${recipeId}/${itemId}`);
  }

  public enchantItem(itemId: number, recipeId: number) {
    return this.get(`/enchant-item/${recipeId}/${itemId}`);
  }

  public getItemDataByRarity(rarity: Rarity) {
    return this.get('/get-item-data-by-rarity/' + rarity);
  }

  public getCombineItemsPreview(itemsIds: Array<number>) {
    return this.post('/combine-items-preview/', { ids: itemsIds });
  }

  public getCombineItems(itemsIds: Array<number>) {
    return this.post('/combine-items/', { ids: itemsIds });
  }
}
