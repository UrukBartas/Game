import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Item, ItemType } from 'src/modules/core/models/items.model';
import { fillInventoryBasedOnPlayerSockets } from 'src/modules/utils';
import { ContextMenuService } from 'src/services/context-menu.service';
import { ViewportService } from 'src/services/viewport.service';
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
  @Input() calculatedStack: Function;
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
  @Output() onDestroyItem = new EventEmitter<Item>();
  public itemType = ItemType;

  public get filteredItems() {
    return fillInventoryBasedOnPlayerSockets(
      this.items
        .filter((item) =>
          item?.itemData?.name
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        )
        .sort(),
      this.sockets
    );
  }

  getShowItemCompare(): boolean {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return true;
      case 'md':
      case 'xs':
      case 'sm':
      default:
        return false;
    }
  }

  public filterByName() {}
}
