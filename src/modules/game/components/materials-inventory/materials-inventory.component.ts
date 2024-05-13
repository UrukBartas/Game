import { Component, Input } from '@angular/core';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { Material } from 'src/modules/core/models/material.model';
import { fillInventoryBasedOnPlayerSockets } from 'src/modules/utils';
export interface ConsumableWithStack extends Consumable {
  stack?: number;
}
@Component({
  selector: 'app-materials-inventory',
  templateUrl: './materials-inventory.component.html',
  styleUrl: './materials-inventory.component.scss',
})
export class MaterialsInventoryComponent {
  @Input() items: Material[] = [];
  @Input() sockets = 0;

  public get filteredItems() {
    return fillInventoryBasedOnPlayerSockets(
      this.items
        .filter((item) =>
          item?.materialData?.name
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
