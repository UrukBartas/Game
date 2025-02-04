import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Item, ItemType } from 'src/modules/core/models/items.model';
import {
  fillInventoryBasedOnPlayerSockets,
  getShowItemCompare,
  globalCalculatedStackRule,
} from 'src/modules/utils';
import { ContextMenuService } from 'src/services/context-menu.service';
import { ItemService } from 'src/services/item.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';
import { BaseInventoryComponent } from '../base-inventory/base-inventory.component';

@Component({
  selector: 'app-item-inventory',
  templateUrl: './item-inventory.component.html',
  styleUrl: './item-inventory.component.scss',
})
export class ItemInventoryComponent extends BaseInventoryComponent {
  @Input() disableDND = true;
  @Input() equippedItemOfType: Item;
  @Input() showContextualMenu = false;
  @Input() contextMenuTemplate: 'anvil' | 'default' = 'default';
  @Input() calculatedStack: Function = globalCalculatedStackRule;
  @Output() onDragStart = new EventEmitter<any>();
  @Output() onDragEnd = new EventEmitter<any>();
  @Output() onDoubleClick = new EventEmitter<any>();
  @Output() equipSpecificSlot = new EventEmitter<{
    item: Item;
    itemType: ItemType;
  }>();
  @Output() onHover = new EventEmitter<Item>();
  viewportService = inject(ViewportService);
  contextMenuService = inject(ContextMenuService);
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private itemService = inject(ItemService);
  @Output() onDestroyItem = new EventEmitter<Item>();
  public itemType = ItemType;
  public isInInventory =
    this.route?.snapshot?.url[0]?.path.includes('inventory');
  public player = this.store.selectSnapshot(MainState).player;

  public get filteredItems() {
    return fillInventoryBasedOnPlayerSockets(
      this.items
        .filter((item) => {
          if (!item) return false;
          const subTabFilterApplied =
            this.filteredItemTypes.includes(item?.itemData?.itemType) ||
            this.filteredItemTypes.length == 0;
          return (
            item?.itemData?.name
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase()) && subTabFilterApplied
          );
        })
        .sort(),
      this.sockets
    );
  }

  getShowItemCompare(): boolean {
    return getShowItemCompare(this.viewportService);
  }

  public filterByName() {}

  constructor() {
    super();
    this.onHover
      .pipe(takeUntilDestroyed())
      .subscribe((data) => this.itemService.hoveredItem$.next(data));
  }
}
