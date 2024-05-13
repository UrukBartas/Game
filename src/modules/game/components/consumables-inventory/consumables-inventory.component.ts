import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { fillInventoryBasedOnPlayerSockets } from 'src/modules/utils';
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
  @Input() sockets = 0;
  @Input() selectedItem: ConsumableWithStack;
  @Output() selectNewItem = new EventEmitter<Consumable>();

  public get filteredItems() {
    return fillInventoryBasedOnPlayerSockets(
      this.items
        .filter((item) =>
          item?.consumableData?.name
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        )
        .sort(),
      this.sockets
    );
  }

  public searchTerm = '';
  constructor() {}
}
