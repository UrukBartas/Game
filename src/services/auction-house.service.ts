import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ItemType, Rarity } from 'src/modules/core/models/items.model';
import { MarketListing } from 'src/modules/core/models/market-listing.model';
import { MiscellanyItemType } from 'src/modules/core/models/misc.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
export enum MarketItemType {
  ITEM = 'ITEM',
  CONSUMABLE = 'CONSUMABLE',
  MISCELLANY = 'MISCELLANY',
  MATERIAL = 'MATERIAL',
}

export class MarketListingPayload {
  typeListing?: MarketItemType | null;
  itemSubtype?: ItemType | null;
  miscSubttype?: MiscellanyItemType | null;
  predefinedFilter?: 'playerCreated';
  searchByName?: string;
  rarity?: Rarity;
  minLevel?: number;
  maxLevel?: number;
  skip?: number;
  take?: number;
  sortBy?: 'price' | 'recent';
  sortOrder?: 'ASC' | 'DESC';
  status?: 'ACTIVE' | 'SOLD' | 'CANCELED';
}
export class NewMarketListingPayloadDTO {
  price: number;
  itemId: number;
  itemType: MarketItemType;
  quantity?: number;
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
    return this.post('/market-listings', payload) as Observable<{
      data: Array<MarketListing>;
      totalItems: number;
    }>;
  }

  public addNewMarketListing(payload: NewMarketListingPayloadDTO) {
    return this.post('/market-listings/new', payload);
  }

  public addNewOffer(payload: { idListing: number; priceOffered: number }) {
    return this.post('/market-listing/offer/place', payload);
  }

  public cancelOffer(payload: { idBid: number }) {
    return this.post('/market-listing/offer/cancel', payload);
  }

  public acceptOffer(payload: { idListing: number; idBid: number }) {
    return this.post('/market-listing/offer/accept', payload);
  }

  public buy(idListing: number) {
    return this.post('/market-listing/buy/' + idListing, {});
  }

  public cancel(idListing: number) {
    return this.post('/market-listing/cancel/' + idListing, {});
  }

  public getBids(idListing: number) {
    return this.get('/market-listing/bids/' + idListing);
  }
}
