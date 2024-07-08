import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Item, ItemType } from 'src/modules/core/models/items.model';

@Component({
  selector: 'app-context-menu-inventory-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './context-menu-inventory-options.component.html',
  styleUrl: './context-menu-inventory-options.component.scss',
})
export class ContextMenuInventoryOptionsComponent {
  @Input() item: Item;
  @Output() clickEquip = new EventEmitter<void>();
  @Output() equipLeftHand = new EventEmitter<void>();
  @Output() clickDestroy = new EventEmitter<void>();
  public itemType = ItemType;
}
