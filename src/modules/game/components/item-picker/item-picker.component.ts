import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { Item } from 'src/modules/core/models/items.model';
import { Material } from 'src/modules/core/models/material.model';
import { MiscellanyItem } from 'src/modules/core/models/misc.model';
import { getGenericItemItemData } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';
import {
  ItemPickerConfig,
  ItemPickerDialogComponent,
} from '../item-picker-dialog/item-picker-dialog.component';

@Component({
  selector: 'app-item-picker',
  templateUrl: './item-picker.component.html',
  styleUrl: './item-picker.component.scss',
})
export class ItemPickerComponent {
  viewportService = inject(ViewportService);
  @Input() itemPickerDialogConfig: ItemPickerConfig;
  @Output() confirmSelection = new EventEmitter<{
    selectedItems: Array<Item>;
    selectedMaterials: Array<Material>;
    selectedConsumables: Array<Consumable>;
    selectedMiscs: Array<MiscellanyItem>;
  }>();
  modalManager = inject(BsModalService);
  getGenericITemData = getGenericItemItemData;
  getItemBoxSize(): number {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 100;
      case 'md':
      case 'xs':
      case 'sm':
      default:
        return 60;
    }
  }
  public selectedMaterials = [];
  public selectedConsumables = [];
  public selectedItems = [];
  public selectedMiscs = [];

  public pick() {
    const ref = this.modalManager.show(ItemPickerDialogComponent, {
      initialState: this.itemPickerDialogConfig
        ? {
            config: this.itemPickerDialogConfig,
          }
        : undefined,
    });
    ref.content.confirmSelection.subscribe((data) => {
      this.confirmSelection.emit(data);
      this.selectedConsumables = data.selectedConsumables;
      this.selectedItems = data.selectedItems;
      this.selectedMaterials = data.selectedMaterials;
      this.selectedMiscs = data.selectedMiscs;
      ref.hide();
    });
  }

  public getImage(item: any) {
    return this.getGenericITemData(item).imageLocal;
  }

  public getAll() {
    return [
      ...this.selectedItems,
      ...this.selectedConsumables,
      ...this.selectedMaterials,
      ...this.selectedMiscs,
    ];
  }

  public hasSomethingSelected() {
    return (
      this.selectedItems.length > 0 ||
      this.selectedConsumables.length > 0 ||
      this.selectedMaterials.length > 0 ||
      this.selectedMiscs.length > 0
    );
  }
}
