import { Component } from '@angular/core';
import { fillInventoryBasedOnPlayerSockets } from 'src/modules/utils';
import { BaseInventoryComponent } from '../base-inventory/base-inventory.component';

@Component({
  selector: 'app-materials-inventory',
  templateUrl: './materials-inventory.component.html',
  styleUrl: './materials-inventory.component.scss',
})
export class MaterialsInventoryComponent extends BaseInventoryComponent {
  public get filteredItems() {
    return fillInventoryBasedOnPlayerSockets(
      this.items
        .filter((item) => {
          if (!item) return false;
          return item?.materialData?.name
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase());
        })
        .sort(),
      this.sockets
    );
  }
}
