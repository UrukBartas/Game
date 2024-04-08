import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Item } from 'src/modules/core/models/items.model';
import { InventoryStructure } from 'src/services/inventory.service';

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
  @Output() selectNewItem = new EventEmitter<Item>();
  @Output() onDragStart = new EventEmitter<any>();
  @Output() onDragEnd = new EventEmitter<any>();
  @Output() onDoubleClick = new EventEmitter<any>();
}
