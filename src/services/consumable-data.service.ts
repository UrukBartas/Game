import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { MiscellanyItemData } from "src/modules/core/models/misc.model";
import { ApiBaseService } from "src/modules/core/services/api-base.service";

@Injectable({
  providedIn: 'root',
})
export class ConsumableDataService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
    this.controllerPrefix = '/consumable-data';
  }

  public byId(id: string) {
    return this.get(`/${id}`) as Observable<MiscellanyItemData>;
  }
}
