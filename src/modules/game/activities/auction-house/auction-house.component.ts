import { Component, computed, effect, inject, signal } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import {
  AuctionHouseService,
  MarketListingPayload,
} from 'src/services/auction-house.service';
import { AuctionHouseNewTradeComponent } from './auction-house-new-trade/auction-house-new-trade.component';
import { getGenericItemItemData } from 'src/modules/utils';
import { MarketListing } from 'src/modules/core/models/market-listing.model';
import { AuctionHouseViewItemComponent } from './auction-house-view-item/auction-house-view-item.component';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-auction-house',
  templateUrl: './auction-house.component.html',
  styleUrl: './auction-house.component.scss',
})
export class AuctionHouseComponent {
  auctionService = inject(AuctionHouseService);
  private marketListingFilter = signal<MarketListingPayload>({});
  private lastMarketListingFilter = null;
  private marketListingFitlerEffect = effect(() => {
    this.lastMarketListingFilter = this.marketListingFilter();
  });
  public getMarketListings = computed(() => {
    return this.auctionService.getMarketListings(this.marketListingFilter());
  });
  private modalService = inject(BsModalService);

  public createNewTrade() {
    const ref = this.modalService.show(AuctionHouseNewTradeComponent, {
      initialState: {
        onAccept: () => {
          console.log('Executed');
          this.marketListingFilter.set(cloneDeep(this.lastMarketListingFilter));
        },
      },
    });
  }
  public viewListing(listing: MarketListing) {
    const ref = this.modalService.show(AuctionHouseViewItemComponent, {
      initialState: {
        listing,
      },
    });
  }

  public getData(listing: MarketListing) {
    return getGenericItemItemData(
      listing.item ??
        listing.consumable ??
        listing.material ??
        listing.miscellany
    );
  }
}
