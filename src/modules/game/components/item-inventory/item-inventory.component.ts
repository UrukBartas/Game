import {
  Component,
  effect,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { includes } from 'lodash';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Item } from 'src/modules/core/models/items.model';
import { ContextMenuService } from 'src/services/context-menu.service';
import { InventoryStructure } from 'src/services/inventory.service';
import { ItemService } from 'src/services/item.service';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-item-inventory',
  templateUrl: './item-inventory.component.html',
  styleUrl: './item-inventory.component.scss',
})
export class ItemInventoryComponent {
  @Input() items: Item[] = [];
  @Input() boxes: Array<InventoryStructure> = [];
  @Input() boxSize: number = 40;
  @Input() disableDND = true;
  @Input() equippedItemOfType: Item;
  @Input() showContextualMenu = false;
  @Input() multipleSelection = false;
  @Input() contextMenuTemplate: 'anvil' | 'default' = 'default';
  @Output() onDragStart = new EventEmitter<any>();
  @Output() onDragEnd = new EventEmitter<any>();
  @Output() onDoubleClick = new EventEmitter<any>();
  @Output() onHover = new EventEmitter<Item>();
  modalService = inject(BsModalService);
  viewportService = inject(ViewportService);
  contextMenuService = inject(ContextMenuService);
  itemService = inject(ItemService);
  @Input() public selectedItems: Array<Item> = [];
  @Output() selectedItemsChange = new EventEmitter<Array<Item>>();
  @Output() onDestroyItem = new EventEmitter<Item>();

  public get filteredItems() {
    return this.items.filter(
      (item) =>
        item?.itemData?.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  public searchTerm = '';

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

  public addToSelectedItems(item: Item) {
    if (!item) return;
    if (!this.multipleSelection) {
      this.selectedItems = [item];
    } else {
      const foundItem = this.selectedItems.findIndex(
        (selectedItem) => selectedItem.id == item.id
      );
      if (foundItem >= 0) {
        this.selectedItems.splice(foundItem, 1);
      } else {
        this.selectedItems.push(item);
      }
    }
    this.selectedItemsChange.emit(this.selectedItems);
  }

  public isMultipleSelected(item: Item): boolean {
    if (!item) return false;
    return !!this.selectedItems.find(
      (selectedItem) => selectedItem.id == item.id
    );
  }

  public filterByName() {}
}
