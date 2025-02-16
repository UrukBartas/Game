import {
  Component,
  computed,
  effect,
  inject,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { cloneDeep } from 'lodash-es';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { debounceTime, filter, map, tap } from 'rxjs';
import { Item, ItemType, Rarity } from 'src/modules/core/models/items.model';
import { MarketListing } from 'src/modules/core/models/market-listing.model';
import { MiscellanyItemType } from 'src/modules/core/models/misc.model';
import {
  getGenericItemItemData,
  getRarityBasedOnIRI,
  getRarityColor,
  getShowItemCompare,
} from 'src/modules/utils';
import {
  AuctionHouseService,
  MarketItemType,
  MarketListingPayload,
} from 'src/services/auction-house.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';
import { AuctionHouseNewTradeComponent } from './auction-house-new-trade/auction-house-new-trade.component';
import { AuctionHouseViewItemComponent } from './auction-house-view-item/auction-house-view-item.component';

@Component({
  selector: 'app-auction-house',
  templateUrl: './auction-house.component.html',
  styleUrl: './auction-house.component.scss',
})
export class AuctionHouseComponent {
  auctionService = inject(AuctionHouseService);
  bsModalService = inject(BsModalService);
  viewportService = inject(ViewportService);
  private marketListingFilter = signal<MarketListingPayload>({});
  public marketItemType = MarketItemType;
  public itemType = ItemType;
  public miscItemType = MiscellanyItemType;
  public rarity = Rarity;
  public lastMarketListingFilter: MarketListingPayload = null;
  getRarityColor = getRarityColor;
  getRarityBasedOnIRI = getRarityBasedOnIRI;
  store = inject(Store);
  player$ = this.store
    .select(MainState.getState)
    .pipe(map((entry) => entry.player));

  public getItem$ = (itemType: ItemType) => {
    return this.player$.pipe(
      filter((player) => !!player),
      map((player) => player.items),
      map((items: Array<Item>) => {
        const foundItem = items.find(
          (item) => item.itemData.itemType == itemType && item.equipped
        );
        return foundItem;
      })
    );
  };
  public sortOrderUp = false;
  public sortType: 'price' | 'recent' = 'recent';
  public prefix = ViewportService.getPreffixImg();
  marketSubtypes = [
    { label: 'Lootbox', subtype: MiscellanyItemType.Lootbox },
    { label: 'Recipe', subtype: MiscellanyItemType.Recipe },
    { label: 'Combo Lootbox', subtype: MiscellanyItemType.ComboLootbox },
    { label: 'Crypt Lootbox', subtype: MiscellanyItemType.CryptLootbox },
    { label: 'Portrait', subtype: MiscellanyItemType.Portrait },
    { label: 'Money Bag', subtype: MiscellanyItemType.MoneyBag },
    { label: 'Item Set', subtype: MiscellanyItemType.ItemSet },
    { label: 'Boost', subtype: MiscellanyItemType.Boost },
    { label: 'Mount', subtype: MiscellanyItemType.Mount },
    { label: 'Silhouette', subtype: MiscellanyItemType.Silhouette },
    { label: 'Title Suffix', subtype: MiscellanyItemType.Title_Suffix },
    { label: 'Title Prefix', subtype: MiscellanyItemType.Title_Prefix },
  ];
  private marketListingFitlerEffect = effect(() => {
    this.lastMarketListingFilter = this.marketListingFilter();
  });
  public activeTab: WritableSignal<'marketplace' | 'mytrades' | 'mybids'> =
    signal('marketplace');

  public getMarketListings = computed(() => {
    return this.auctionService
      .getMarketListings(this.marketListingFilter())
      .pipe(tap((data) => this.lastMarketListing.set(data)));
  });

  public lastMarketListing = signal<{
    data: Array<MarketListing>;
    totalItems: number;
  }>({} as any);
  public searchTerm = new FormControl();
  searchTermChanged = this.searchTerm.valueChanges
    .pipe(debounceTime(300))
    .subscribe((value) => {
      this.marketListingFilter.set({
        ...this.lastMarketListingFilter,
        searchByName: value,
      });
    });
  public minLevel = new FormControl();
  minLevelChanged = this.minLevel.valueChanges
    .pipe(debounceTime(300))
    .subscribe((value) => {
      this.marketListingFilter.set({
        ...this.lastMarketListingFilter,
        minLevel: value,
      });
    });
  public maxLevel = new FormControl();
  maxLevelChanged = this.maxLevel.valueChanges
    .pipe(debounceTime(300))
    .subscribe((value) => {
      this.marketListingFilter.set({
        ...this.lastMarketListingFilter,
        maxLevel: value,
      });
    });
  public selectRarity = new FormControl('ALL');
  selectRarityChanged = this.selectRarity.valueChanges.subscribe(
    (value: any) => {
      if (value.toUpperCase() == 'ALL') value = null;
      this.marketListingFilter.set({
        ...this.lastMarketListingFilter,
        rarity: value,
      });
    }
  );
  public selectStatus = new FormControl<
    'ACTIVE' | 'SOLD' | 'BOUGHT' | 'WITH_BIDS'
  >('ACTIVE');
  selectStatusChanged = this.selectStatus.valueChanges.subscribe((value) => {
    this.marketListingFilter.set({
      ...this.lastMarketListingFilter,
      status: value,
    });
  });
  private modalService = inject(BsModalService);
  public createNewTrade() {
    const ref = this.modalService.show(AuctionHouseNewTradeComponent, {
      initialState: {
        onAccept: () => {
          this.marketListingFilter.set(cloneDeep(this.lastMarketListingFilter));
        },
      },
    });
  }
  public viewListing(listing: MarketListing) {
    const ref = this.modalService.show(AuctionHouseViewItemComponent, {
      initialState: {
        listing,
        onAccept: () => {
          this.marketListingFilter.set(cloneDeep(this.lastMarketListingFilter));
        },
      },
    });
    ref.onHide.subscribe(() =>
      this.marketListingFilter.set(cloneDeep(this.lastMarketListingFilter))
    );
  }

  public getData(listing: MarketListing) {
    return getGenericItemItemData(
      listing.item ??
        listing.consumable ??
        listing.material ??
        listing.miscellany
    );
  }

  public pageChanged(page: PageChangedEvent) {
    const number = cloneDeep(page).page;
    this.marketListingFilter.set({
      ...this.lastMarketListingFilter,
      skip: number - 1,
    });
  }

  public displayMyTrades() {
    this.marketListingFilter.set({
      ...this.lastMarketListingFilter,
      predefinedFilter: 'playerCreated',
    });
  }

  public displayAllTrades() {
    this.marketListingFilter.set({
      ...this.lastMarketListingFilter,
      predefinedFilter: null,
    });
  }

  public applyItemFilterType(
    typeListing: MarketItemType,
    itemSubtype: ItemType,
    miscSubttype: MiscellanyItemType
  ) {
    this.marketListingFilter.set({
      ...this.lastMarketListingFilter,
      typeListing,
      itemSubtype,
      miscSubttype,
    });
  }

  changeSortOrder() {
    this.sortOrderUp = !this.sortOrderUp;
    this.marketListingFilter.set({
      ...this.lastMarketListingFilter,
      sortBy: this.sortType,
      sortOrder: !!this.sortOrderUp ? 'ASC' : 'DESC',
    });
  }

  changeSortType() {
    this.sortType = this.sortType === 'recent' ? 'price' : 'recent';
    this.marketListingFilter.set({
      ...this.lastMarketListingFilter,
      sortBy: this.sortType,
      sortOrder: !!this.sortOrderUp ? 'ASC' : 'DESC',
    });
  }

  openModal(template: TemplateRef<void>) {
    this.modalService.show(template, { class: 'filters-modal' });
  }

  public closeModal() {
    this.modalService.hide();
  }

  getShowItemCompare(): boolean {
    return getShowItemCompare(this.viewportService);
  }
}
