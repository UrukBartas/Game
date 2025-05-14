import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Quote, QuoteItem } from 'src/modules/core/models/uruk-checkout.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class UrukCheckoutService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/uruk-checkout';
  }

  /**
   * Gets a quote for the specified items
   * @param items List of items to get a quote for
   * @returns Observable with the quote information including prices and verification hash
   */
  public getQuote(items: QuoteItem[]): Observable<Quote> {
    return this.post('/quote', { items });
  }

}
