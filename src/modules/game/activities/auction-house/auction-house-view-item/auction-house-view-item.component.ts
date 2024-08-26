import { Component, inject, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { filter, firstValueFrom, map, of } from 'rxjs';
import { MarketListing } from 'src/modules/core/models/market-listing.model';
import { getGenericItemItemData } from 'src/modules/utils';
import { AuctionHouseService } from 'src/services/auction-house.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';

@Component({
  selector: 'app-auction-house-view-item',
  templateUrl: './auction-house-view-item.component.html',
  styleUrl: './auction-house-view-item.component.scss',
})
export class AuctionHouseViewItemComponent {
  @Input() public set listing(data: MarketListing) {
    this._listing = data;
    this.getBids$ = this.auctionService.getBids(data.id);
  }
  public get listing() {
    return this._listing;
  }
  public getBids$ = of([]);
  private _listing: MarketListing;
  viewportService = inject(ViewportService);
  auctionService = inject(AuctionHouseService);
  private modalService = inject(BsModalService);
  public offerPrice = new FormControl(0);
  public addingOffer = false;
  toast = inject(ToastrService);
  store = inject(Store);
  modalRef = inject(BsModalRef);
  onAccept: Function;
  public player$ = this.store.select(MainState.getState).pipe(
    filter((player) => !!player),
    map((entry) => entry.player)
  );
  public getGenericItemItemData = getGenericItemItemData;
  getItemBoxSize(): number {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 200;
      case 'md':
      case 'xs':
      case 'sm':
      default:
        return 60;
    }
  }
  public getPlayerImageSize() {
    if (
      this.viewportService.screenSize === 'xs' ||
      this.viewportService.screenSize === 'sm' ||
      this.viewportService.screenSize === 'md'
    ) {
      return 30;
    }
    return 40;
  }

  public async buy() {
    try {
      const bought = await firstValueFrom(
        this.auctionService.buy(this.listing.id)
      );
      this.toast.success(
        `Congratulations, you bought the item.`,
        'You have a new item in your inventory!'
      );
      if (this.onAccept) this.onAccept();
    } catch (error) {
      this.toast.error(`Error creating the trade ${error}`);
    }
    this.modalRef.hide();
  }

  public async cancel() {
    try {
      const bought = await firstValueFrom(
        this.auctionService.cancel(this.listing.id)
      );
      this.toast.info(
        `You cancelled the listing and the item should have returned your inventory.`,
        'Listing cancelled!'
      );
      if (this.onAccept) this.onAccept();
    } catch (error) {
      this.toast.error(`Error cancelling the trade ${error}`);
    }
    this.modalRef.hide();
  }

  public async confirmOffer() {
    try {
      await firstValueFrom(
        this.auctionService.addNewOffer({
          idListing: this.listing.id,
          priceOffered: this.offerPrice.value,
        })
      );
      this.getBids$ = this.auctionService.getBids(this.listing.id);
      this.toast.info(`You created an offer for the listing.`, 'Offer added!');
      this.offerPrice.reset();
    } catch (error) {
      this.toast.error(`Error adding offer to the listing ${error}`);
    }
  }

  public async acceptOffer(idBid: number) {
    try {
      await firstValueFrom(
        this.auctionService.acceptOffer({
          idListing: this.listing.id,
          idBid: idBid,
        })
      );
      this.toast.info(`You accepted the offer.`, 'Offer accepted!');
      if (this.onAccept) this.onAccept();
      this.modalRef.hide();
    } catch (error) {
      this.toast.error(`Error accepting the offer ${error}`);
    }
  }

  public async cancelOffer(idBid: number) {
    try {
      await firstValueFrom(
        this.auctionService.cancelOffer({
          idBid: idBid,
        })
      );
      this.toast.info(`You canceled the offer.`, 'Offer canceled');
      this.getBids$ = this.auctionService.getBids(this.listing.id);
    } catch (error) {
      this.toast.error(`Error canceling the offer ${error}`);
    }
  }
}
