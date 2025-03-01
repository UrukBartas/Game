import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalService } from 'ngx-bootstrap/modal';
import { filter, map } from 'rxjs';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { Item } from 'src/modules/core/models/items.model';
import { Material } from 'src/modules/core/models/material.model';
import { MiscellanyItem } from 'src/modules/core/models/misc.model';
import { PlayerService } from 'src/services/player.service';
import { MainState } from 'src/store/main.store';

export interface ItemPickerConfig {
  display: {
    itemPicking: boolean;
    materialPicking: boolean;
    consumablePicking: boolean;
    miscPicking: boolean;
  };
  multipleSelection?: {
    itemPicking?: boolean;
    materialPicking?: boolean;
    consumablePicking?: boolean;
    miscPicking?: boolean;
  };
  filters?: {
    item?: (items: Array<Item>) => Array<Item>;
    material?: (materials: Array<Material>) => Array<Material>;
    consumable?: (consumable: Array<Consumable>) => Array<Consumable>;
    misc?: (misc: Array<MiscellanyItem>) => Array<MiscellanyItem>;
  };
}

@Component({
  selector: 'app-item-picker-dialog',
  templateUrl: './item-picker-dialog.component.html',
  styleUrl: './item-picker-dialog.component.scss',
})
export class ItemPickerDialogComponent {
  modalRef = inject(BsModalService);
  playerService = inject(PlayerService);
  store = inject(Store);
  currentInventory$ = this.playerService.getItems();
  public currentSize$ = this.store.select(MainState.getState).pipe(
    filter((player) => !!player),
    map((entry) => entry?.player?.sockets)
  );
  @Input() config: ItemPickerConfig = {
    display: {
      itemPicking: true,
      materialPicking: true,
      consumablePicking: true,
      miscPicking: true,
    },
  };
  currentConsumableInventory$ = this.playerService.getItemsConsumable();
  currentMaterials$ = this.playerService.getItemsMaterial();
  currentMiscInventory$ = this.playerService.getMiscellanyItems();
  selectedItems: Array<Item> = [];
  selectedMaterials: Array<Material> = [];
  selectedConsumables: Array<Consumable> = [];
  selectedtableMisc: Array<MiscellanyItem> = [];
  @Output() confirmSelection = new EventEmitter<{
    selectedItems: Array<Item>;
    selectedMaterials: Array<Material>;
    selectedConsumables: Array<Consumable>;
    selectedMiscs: Array<MiscellanyItem>;
  }>();

  public accept() {
    this.confirmSelection.emit({
      selectedItems: this.selectedItems,
      selectedMaterials: this.selectedMaterials,
      selectedConsumables: this.selectedConsumables,
      selectedMiscs: this.selectedtableMisc,
    });
  }

  public hasSomethingSelected() {
    return (
      this.selectedItems.length > 0 ||
      this.selectedConsumables.length > 0 ||
      this.selectedMaterials.length > 0 ||
      this.selectedtableMisc.length > 0
    );
  }
}
