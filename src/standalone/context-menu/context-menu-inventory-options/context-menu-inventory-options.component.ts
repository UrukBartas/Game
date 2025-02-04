import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Item, ItemType } from 'src/modules/core/models/items.model';
import { BlacksmithModalComponent } from 'src/modules/game/activities/blacksmith/modal/blacksmith-modal.component';
import { ContextMenuService } from 'src/services/context-menu.service';
import { ItemService } from 'src/services/item.service';
import { RefreshPlayer } from 'src/store/main.store';

@Component({
  selector: 'app-context-menu-inventory-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './context-menu-inventory-options.component.html',
  styleUrl: './context-menu-inventory-options.component.scss',
})
export class ContextMenuInventoryOptionsComponent {
  @Input() item: Item;
  @Input() displayEquip = true;
  @Input() displayEquipLeftHand = true;
  @Input() displayDestroy = true;
  @Input() displayRepair = true;
  @Output() clickEquip = new EventEmitter<void>();
  @Output() equipLeftHand = new EventEmitter<void>();
  @Output() clickDestroy = new EventEmitter<void>();
  public itemType = ItemType;
  public store = inject(Store);
  modalService = inject(BsModalService);
  contextMenuService = inject(ContextMenuService);

  private itemService = inject(ItemService);
  private toast = inject(ToastrService);

  public async repairItem(item: Item) {
    const config: ModalOptions = {
      initialState: {
        action: 'repairs',
        items: [item],
        onJobDone: (result) => {
          this.store.dispatch(new RefreshPlayer());
          this.toast.success(
            'Repair of ' + item.itemData.name + ' was successful!'
          );
        },
      },
    };
    const ref = this.modalService.show(BlacksmithModalComponent, config);
    //  await firstValueFrom(this.itemService.getRepairItems([item.id]));
    this.contextMenuService.hideContextMenu();
  }
}
