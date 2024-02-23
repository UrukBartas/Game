import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class ShopService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/shop';
  }

  public freeRoll() {
    return this.get('/free-roll');
  }

  public paidRoll() {
    return this.get('/paid-roll');
  }
}
