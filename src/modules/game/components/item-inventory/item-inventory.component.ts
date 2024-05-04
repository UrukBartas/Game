import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { filter, firstValueFrom, map } from 'rxjs';
import { Item } from 'src/modules/core/models/items.model';
import { ContextMenuService } from 'src/services/context-menu.service';
import { InventoryStructure } from 'src/services/inventory.service';
import { ItemService } from 'src/services/item.service';
import { ShopService } from 'src/services/shop.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';
import { ConfirmModalComponent } from '../confirm-modal/confirm.modal.component';

@Component({
  selector: 'app-item-inventory',
  templateUrl: './item-inventory.component.html',
  styleUrl: './item-inventory.component.scss',
})
export class ItemInventoryComponent {
  @Input() items: Item[] = [];
  @Input() boxes: Array<InventoryStructure> = [];
  @Input() boxSize: number = 40;
  @Input() selectedItem: Item;
  @Input() disableDND = true;
  @Input() equippedItemOfType: Item;
  @Input() showContextualMenu = false;
  @Input() contextMenuTemplate: 'anvil' | 'default' = 'default';
  @Output() selectNewItem = new EventEmitter<Item>();
  @Output() onDragStart = new EventEmitter<any>();
  @Output() onDragEnd = new EventEmitter<any>();
  @Output() onDoubleClick = new EventEmitter<any>();
  @Output() onHover = new EventEmitter<Item>();
  modalService = inject(BsModalService);
  viewportService = inject(ViewportService);
  contextMenuService = inject(ContextMenuService);
  itemService = inject(ItemService);

  @Output() onDestroyItem = new EventEmitter<Item>();

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
}
