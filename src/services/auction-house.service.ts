import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ItemType, Rarity } from 'src/modules/core/models/items.model';
import { MarketListing } from 'src/modules/core/models/market-listing.model';
import { MiscellanyItemType } from 'src/modules/core/models/misc.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
import { RefreshPlayer } from 'src/store/main.store';
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
  status?: 'ACTIVE' | 'SOLD' | 'BOUGHT' | 'WITH_BIDS';
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

  public changePrice$(idListing: number, newPrice: number) {
    return this.post(`/market-listing/changePrice/${idListing}`, {
      newPrice,
    });
  }

  public getHistoricalTrades$(idListing: number) {
    return this.get('/historical-trades/' + idListing) as Observable<
      Array<MarketListing>
    >;
  }

  public getPriceSeries$(idListing: number) {
    return this.get('/historical-price-series/' + idListing) as Observable<{
      avg: number;
      series: [];
    }>;
  }

  public getMarketListings(payload: MarketListingPayload) {
    return this.post('/market-listings', payload) as Observable<{
      data: Array<MarketListing>;
      totalItems: number;
    }>;
  }

  public addNewMarketListing(payload: NewMarketListingPayloadDTO) {
    return this.post('/market-listings/new', payload).pipe(
      tap(() => this.store.dispatch(new RefreshPlayer()))
    );
  }

  public addNewOffer(payload: { idListing: number; priceOffered: number }) {
    return this.post('/market-listing/offer/place', payload).pipe(
      tap(() => this.store.dispatch(new RefreshPlayer()))
    );
  }

  public cancelOffer(payload: { idBid: number }) {
    return this.post('/market-listing/offer/cancel', payload).pipe(
      tap(() => this.store.dispatch(new RefreshPlayer()))
    );
  }

  public acceptOffer(payload: { idListing: number; idBid: number }) {
    return this.post('/market-listing/offer/accept', payload).pipe(
      tap(() => this.store.dispatch(new RefreshPlayer()))
    );
  }

  public buy(idListing: number) {
    return this.post('/market-listing/buy/' + idListing, {}).pipe(
      tap(() => this.store.dispatch(new RefreshPlayer()))
    );
  }

  public cancel(idListing: number) {
    return this.post('/market-listing/cancel/' + idListing, {}).pipe(
      tap(() => this.store.dispatch(new RefreshPlayer()))
    );
  }

  public getBids(idListing: number) {
    return this.get('/market-listing/bids/' + idListing);
  }
}
