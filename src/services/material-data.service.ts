import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { MaterialData } from "src/modules/core/models/material.model";
import { ApiBaseService } from "src/modules/core/services/api-base.service";

@Injectable({
  providedIn: 'root',
})
export class MaterialDataService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
    this.controllerPrefix = '/materials-data';
  }

  public byId(id: string) {
    return this.get(`/${id}`) as Observable<MaterialData>;
  }
}
