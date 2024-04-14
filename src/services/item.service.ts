import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
}
