import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { filter, firstValueFrom, map } from 'rxjs';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { Item } from 'src/modules/core/models/items.model';
import { Material } from 'src/modules/core/models/material.model';
import { MiscellanyItem } from 'src/modules/core/models/misc.model';
import { getGenericItemItemData } from 'src/modules/utils';
import {
  AuctionHouseService,
  MarketItemType,
} from 'src/services/auction-house.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';

@Component({
  selector: 'app-auction-house-new-trade',
  templateUrl: './auction-house-new-trade.component.html',
  styleUrl: './auction-house-new-trade.component.scss',
})
export class AuctionHouseNewTradeComponent {
  modalRef = inject(BsModalRef);
  playerService = inject(PlayerService);
  marketPlaceService = inject(AuctionHouseService);
  store = inject(Store);
  toast = inject(ToastrService);
  viewportService = inject(ViewportService);
  currentInventory$ = this.playerService.getItems();
  selectedItems: Array<Item> = [];
  selectedMaterials: Array<Material> = [];
  selectedConsumables: Array<Consumable> = [];
  selectedtableMisc: Array<MiscellanyItem> = [];
  public price = new FormControl(0, [Validators.min(0.0000001)]);
  public quantity = new FormControl(1, [Validators.min(1)]);
  public getGenericItemItemData = getGenericItemItemData;
  onAccept: Function;
  public marketItemType = MarketItemType;

  public getSelectedItem(): any {
    if (this.selectedItems.length > 0) return this.selectedItems[0];
    if (this.selectedConsumables.length > 0) return this.selectedConsumables[0];
    if (this.selectedMaterials.length > 0) return this.selectedMaterials[0];
    if (this.selectedtableMisc.length > 0) return this.selectedtableMisc[0];
    return null;
  }

  public getSelectedImage() {
    const selected = this.getSelectedItem();
    if (!selected) return '';
    const itemData = getGenericItemItemData(selected);
    return itemData.imageLocal;
  }

  public currentSize$ = this.store.select(MainState.getState).pipe(
    filter((player) => !!player),
    map((entry) => entry.player.sockets)
  );
  currentConsumableInventory$ = this.playerService.getItemsConsumable();
  currentMaterials$ = this.playerService.getItemsMaterial();
  currentMiscInventory$ = this.playerService.getMiscellanyItems();

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

  async accept() {
    const selectedItem = this.getSelectedItem();
    try {
      const res = await firstValueFrom(
        this.marketPlaceService.addNewMarketListing({
          price: this.price.value,
          itemId: selectedItem.id,
          itemType: this.getItemType(selectedItem),
          quantity: this.quantity.value ?? 1,
        })
      );
      this.toast.success(
        `Congratulations, your trade with id ${res.id} has been opened successfully.`,
        'You opened a new trade!'
      );
      if (this.onAccept) this.onAccept();
      this.modalRef.hide();
    } catch (error) {
      this.toast.error(`Error creating the trade ${error}`);
    }
  }

  public getItemType(selectedItem: any) {
    if (!!selectedItem.itemData) return MarketItemType.ITEM;
    if (!!selectedItem.miscellanyItemData) return MarketItemType.MISCELLANY;
    if (!!selectedItem.consumableData) return MarketItemType.CONSUMABLE;
    if (!!selectedItem.materialData) return MarketItemType.MATERIAL;
    return null;
  }
}
