import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConsumableData } from 'src/modules/core/models/consumable.model';
import { ItemData } from 'src/modules/core/models/items.model';
import { QuestDataModel } from 'src/modules/core/models/quest-data.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
import { Adventure } from './adventures.service';
import { Observable } from 'rxjs';
import { MaterialData } from 'src/modules/core/models/material.model';

export interface AdventureData {
  id: number;
  name: string;
  description: string;
  image: string;
  minLevel: number;
  questsData: QuestDataModel[];
  itemData: ItemData[];
  consumablesData: ConsumableData[];
  materialsData: MaterialData[];
  Adventure: Adventure[];
}

@Injectable({
  providedIn: 'root',
})
export class AdventuresDataService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
    this.controllerPrefix = '/adventure-data';
  }

  public getAvailableAdventures() {
    return this.get('/all-adventures') as Observable<Array<AdventureData>>;
  }
}
