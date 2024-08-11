import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
export enum MarketItemType {
  ITEM = 'ITEM',
  CONSUMABLE = 'CONSUMABLE',
  MISCELLANY = 'MISCELLANY',
  MATERIAL = 'MATERIAL',
}

export class MarketListingPayload {
  typeListing?: MarketItemType | null;
  predefinedFilter?: 'playerCreated';
}
export class NewMarketListingPayloadDTO {
  price: number;
  itemId: number;
  itemType: MarketItemType;
}

@Injectable({
  providedIn: 'root',
})
export class AuctionHouseService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
    this.controllerPrefix = '/marketplace';
  }

  public getMarketListings(payload: MarketListingPayload) {
    return this.post('/market-listings', payload);
  }

  public addNewMarketListing(payload: NewMarketListingPayloadDTO) {
    return this.post('/market-listings/new', payload);
  }

  public buy(idListing: number) {
    return this.post('/market-listing/buy/' + idListing, {});
  }
}
