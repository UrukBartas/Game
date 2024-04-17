import { Component, Input } from '@angular/core';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { Material } from 'src/modules/core/models/material.model';
import { InventoryStructure } from 'src/services/inventory.service';
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
  @Input() boxes: Array<InventoryStructure> = [];
  constructor(){
  }
}
