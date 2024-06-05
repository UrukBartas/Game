import { Injectable } from '@angular/core';
import { ApiBaseService } from '../modules/core/services/api-base.service';
import { HttpClient } from '@angular/common/http';
import { Item } from 'src/modules/core/models/items.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MiscellanyService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/miscellany';
  }

  public openLootbox(lootboxId: number): Observable<{
    spinWheelItems: Array<Item>;
    resultItem: Item;
  }> {
    return this.get('/open-lootbox/' + lootboxId);
  }
}
