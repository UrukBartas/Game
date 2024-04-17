import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { InventoryStructure } from 'src/services/inventory.service';
export interface ConsumableWithStack extends Consumable {
  stack?: number;
}
@Component({
  selector: 'app-consumables-inventory',
  templateUrl: './consumables-inventory.component.html',
  styleUrl: './consumables-inventory.component.scss',
})
export class ConsumablesInventoryComponent {
  @Input() items: ConsumableWithStack[] = [];
  @Input() boxes: Array<InventoryStructure> = [];
  @Input() selectedItem: ConsumableWithStack;
  @Output() selectNewItem = new EventEmitter<Consumable>();
  constructor() {}
}
