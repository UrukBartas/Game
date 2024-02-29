import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class ShopService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/shop';
  }

  public buyItems(itemIds: number[]) {
    return this.post('/buy', { itemIds });
  }

  public dailyRoll() {
    return this.get('/daily-roll');
  }

  public premiumRoll() {
    return this.get('/premium-roll');
  }

  public getPremiumRollData(): Observable<{
    price: number;
    rollNumber: number;
  }> {
    return this.get('/premium-roll-data');
  }

  public getDailyRollData(): Observable<Date> {
    return this.get('/daily-roll-data');
  }
}
