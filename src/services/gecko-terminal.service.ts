import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiBaseService } from "src/modules/core/services/api-base.service";

@Injectable({
  providedIn: 'root',
})
export class GeckoTerminalService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
    this.controllerPrefix = '/oracle';
  }

  public getTokenPriceUSD$() {
    return this.get('/token-price-usd');
  }

  public getTokenPriceIOTA$() {
    return this.get('/token-price-iota');
  }

}