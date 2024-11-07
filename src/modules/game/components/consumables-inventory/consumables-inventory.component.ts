import { Component, Input, inject } from '@angular/core';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { StackPipe } from 'src/modules/core/pipes/stack.pipe';
import { fillInventoryBasedOnPlayerSockets } from 'src/modules/utils';
import { BaseInventoryComponent } from '../base-inventory/base-inventory.component';
export interface ConsumableWithStack extends Consumable {
  stack?: number;
}
@Component({
  selector: 'app-consumables-inventory',
  templateUrl: './consumables-inventory.component.html',
  styleUrl: './consumables-inventory.component.scss',
})
export class ConsumablesInventoryComponent extends BaseInventoryComponent {
  @Input() selectedItem: ConsumableWithStack;
  stack = inject(StackPipe);

  public get filteredItems() {
    return fillInventoryBasedOnPlayerSockets(
      // this.stack
      //   .transform(this.items, 'consumableData.name')
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
}
