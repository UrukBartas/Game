import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { Item, Rarity } from 'src/modules/core/models/items.model';
import { InventoryService } from 'src/services/inventory.service';

@Component({
  selector: 'app-inventory-topbar',
  templateUrl: './inventory-topbar.component.html',
  styleUrl: './inventory-topbar.component.scss',
})
export class InventoryTopbarComponent {
  private inventoryService = inject(InventoryService);
  @Input() disableSort = false;
  @Input() public set inventory(data: Array<any>) {
    this._inventory = this.sortInventory(data);
  }

  public get inventory() {
    return this._inventory;
  }

  private _inventory: Array<any> = [];
  @Output() inventoryChange = new EventEmitter<any[]>();
  public itemInventoryBoxes = this.inventoryService.getInventoryStructure();
  public sortOrderUp = false;
  public sortType: 'rarity' | 'level' = 'rarity';

  @Input() searchTerm: string = '';
  @Output() searchTermChange = new EventEmitter<string>();
  public searchControl = new FormControl(this.searchTerm);
  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe((data) => {
        this.searchTermChange.emit(data);
      });
  }

  ngAfterViewInit(): void {
    this.searchControl.patchValue(this.searchTerm);
  }

  changeSortOrder() {
    this.sortOrderUp = !this.sortOrderUp;
    this.inventory = this.sortInventory(this.inventory);
    this.inventoryChange.emit(this.inventory);
  }

  changeSortType() {
    this.sortType = this.sortType === 'rarity' ? 'level' : 'rarity';
    this.inventory = this.sortInventory(this.inventory);
    this.inventoryChange.emit(this.inventory);
  }

  private sortInventory(items: Array<any>) {
    if (this.disableSort) return items;
    const rarityOrder = [
      Rarity.COMMON,
      Rarity.UNCOMMON,
      Rarity.EPIC,
      Rarity.LEGENDARY,
      Rarity.MYTHIC,
    ];
    const sortedItems = items.sort((a, b) => {
      let comparison = 0;
      if (this.sortType === 'level') {
        comparison = a.level - b.level;
      } else if (this.sortType === 'rarity') {
        let data = a.itemData ?? a.materialData ?? a.consumableData;
        let dataB = b.itemData ?? b.materialData ?? b.consumableData;
        if (!data.rarity || !dataB.rarity) comparison = 0;
        comparison =
          rarityOrder.indexOf(data.rarity) - rarityOrder.indexOf(dataB.rarity);
      }
      return this.sortOrderUp ? comparison : -comparison;
    });
    return sortedItems;
  }
}
