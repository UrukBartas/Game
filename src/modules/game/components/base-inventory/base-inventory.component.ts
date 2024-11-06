import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  template: '',
})
export class BaseInventoryComponent {
  @Input() items: any = [];
  @Input() sockets = 0;
  @Input() multipleSelection = false;
  @Input() boxSize: number = 40;
  @Input() actionable = true;

  public searchTerm = '';
  public filteredItemTypes = []
  @Input() selectedItems: any[] = [];
  @Output() selectedItemsChange = new EventEmitter<Array<any>>();

  public addToSelectedItems(item: any) {
    if (!item) return;
    if (this.selectedItems.length == 1 && item == this.selectedItems[0]) {
      this.selectedItems = [];
      this.selectedItemsChange.emit(this.selectedItems);
      return;
    }
    if (!item['quantityToExport']) item['quantityToExport'] = 1;
    if (!this.multipleSelection) {
      this.selectedItems = [item];
    } else {
      const foundItem = this.findItemIndex(item);
      if (foundItem >= 0) {
        this.selectedItems.splice(foundItem, 1);
      } else {
        this.selectedItems.push(item);
      }
    }
    this.selectedItemsChange.emit(this.selectedItems);
  }

  private findItemIndex(item: any) {
    if (!!item.tokenId) {
      return this.selectedItems.findIndex(
        (selectedItem) => selectedItem.tokenId == item.tokenId
      );
    }
    return this.selectedItems.findIndex(
      (selectedItem) => selectedItem.id == item.id
    );
  }

  public isMultipleSelected(item: any): boolean {
    if (!item) return false;
    return this.findItemIndex(item) >= 0;
  }
}
