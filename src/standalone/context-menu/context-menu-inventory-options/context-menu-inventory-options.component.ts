import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { Item, ItemType } from 'src/modules/core/models/items.model';
import { ContextMenuService } from 'src/services/context-menu.service';
import { ItemService } from 'src/services/item.service';

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
  contextMenuService = inject(ContextMenuService);

  private itemService = inject(ItemService);
  private toast = inject(ToastrService);

  public async repairItem(item: Item) {
    await firstValueFrom(this.itemService.getRepairItems([item.id]));
    this.toast.success('Repair of ' + item.itemData.name + ' was successful!');
    this.contextMenuService.hideContextMenu();
  }
}
