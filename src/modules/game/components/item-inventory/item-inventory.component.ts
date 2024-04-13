import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { firstValueFrom, map, tap } from 'rxjs';
import { Item } from 'src/modules/core/models/items.model';
import { InventoryStructure } from 'src/services/inventory.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';
import { ConfirmModalComponent } from '../confirm-modal/confirm.modal.component';
import { ShopService } from 'src/services/shop.service';
import { ContextMenuService } from 'src/services/context-menu.service';
import { PlayerService } from 'src/services/player.service';
import { ItemService } from 'src/services/item.service';

@Component({
  selector: 'app-item-inventory',
  templateUrl: './item-inventory.component.html',
  styleUrl: './item-inventory.component.scss',
})
export class ItemInventoryComponent {
  @Input() items: Item[] = [];
  @Input() boxes: Array<InventoryStructure> = [];
  @Input() selectedItem: Item;
  @Input() disableDND = true;
  @Input() addExpandInventory = false;
  @Output() selectNewItem = new EventEmitter<Item>();
  @Output() onDragStart = new EventEmitter<any>();
  @Output() onDragEnd = new EventEmitter<any>();
  @Output() onDoubleClick = new EventEmitter<any>();
  private store = inject(Store);
  modalService = inject(BsModalService);
  private shopService = inject(ShopService);
  public currentSize$ = this.store
    .select(MainState.getState)
    .pipe(map((entry) => entry.player.sockets));
  //Level 4 is the default level. 80 is default socket size / 20 = 4. If it buys another it becomes 5 (100 /20)
  public currentLevel$ = this.currentSize$.pipe(map((sockets) => sockets / 20));
  public maxLevel = 10;
  contextMenuService = inject(ContextMenuService);
  itemService = inject(ItemService);

  @Output() onDestroyItem = new EventEmitter<Item>();

  public confirmPurchase() {
    const config: ModalOptions = {
      initialState: {
        title: 'Purchase',
        description: `This will add 20 more slots to your inventory. Do you want to proceed?`,
        accept: async () => {
          try {
            await firstValueFrom(this.shopService.buyInventoryExpand());
            this.store.dispatch(new RefreshPlayer());
          } catch (error) {
            console.error(error);
          }

          modalRef.hide();
        },
      },
    };
    const modalRef = this.modalService.show(ConfirmModalComponent, config);
  }
}
