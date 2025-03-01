import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { debounceTime, filter, map } from 'rxjs';
import { ItemType, Rarity } from 'src/modules/core/models/items.model';
import { MainState } from 'src/store/main.store';
const itemFilterTypes = [
  {
    id: 1,
    image: '/assets/icons/crested-helmet.png',
    type: [ItemType.HELMET],
  },
  {
    id: 2,
    image: '/assets/icons/chest-armor.png',
    type: [ItemType.CHEST],
  },
  {
    id: 3,
    image: '/assets/icons/gauntlet.png',
    type: [ItemType.GLOVES],
  },
  {
    id: 4,
    image: '/assets/icons/armored-pants.png',
    type: [ItemType.TROUSERS],
  },
  {
    id: 5,
    image: '/assets/icons/diamond-hilt.png',
    type: [ItemType.Weapon1H, ItemType.Weapon2H],
  },
  {
    id: 6,
    image: '/assets/icons/templar-shield.png',
    type: [ItemType.SHIELD],
  },
  {
    id: 7,
    image: '/assets/icons/sandal.png',
    type: [ItemType.BOOTS],
  },
  {
    id: 8,
    image: '/assets/icons/ring.png',
    type: [ItemType.RING],
  },
  {
    id: 9,
    image: '/assets/icons/old-lantern.png',
    type: [ItemType.CHARM],
  },
];

@Component({
  selector: 'app-inventory-topbar',
  templateUrl: './inventory-topbar.component.html',
  styleUrl: './inventory-topbar.component.scss',
})
export class InventoryTopbarComponent {
  public activeItemFilterType = null;
  @Input() itemFilterTypes: {
    id: number;
    image: string;
    type: any[];
  }[] = itemFilterTypes;
  @Input() filteredItemTypes: Array<ItemType> = [];
  @Output() filteredItemTypesChange = new EventEmitter<Array<ItemType>>();
  @Input() disableSort = false;
  @Input() activeFilterByItemTypes = false;
  @Input() public set inventory(data: Array<any>) {
    this._inventory = this.sortInventory(data);
  }

  public applyItemFilterType(itemFilterType: { type: ItemType[] }) {
    if (this.activeItemFilterType == itemFilterType) {
      this.activeItemFilterType = null;
      this.filteredItemTypesChange.emit([]);
    } else {
      this.activeItemFilterType = itemFilterType;
      this.filteredItemTypesChange.emit(this.activeItemFilterType.type);
    }
  }

  public get inventory() {
    return this._inventory.filter((entry) => !!entry);
  }
  store = inject(Store);
  public currentSize$ = this.store.select(MainState.getState).pipe(
    filter((player) => !!player),
    map((entry) => entry?.player?.sockets)
  );
  private _inventory: Array<any> = [];
  @Output() inventoryChange = new EventEmitter<any[]>();
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
    const sortedItems = (items ?? []).sort((a, b) => {
      let comparison = 0;
      if (!a || !b) return 0;
      if (this.sortType === 'level') {
        comparison = a.level - b.level;
      } else if (this.sortType === 'rarity') {
        let data = a.itemData ?? a.materialData ?? a.consumableData;
        let dataB = b.itemData ?? b.materialData ?? b.consumableData;
        if (!data?.rarity || !dataB?.rarity) comparison = 0;
        comparison =
          rarityOrder.indexOf(data?.rarity) -
          rarityOrder.indexOf(dataB?.rarity);
      }
      return this.sortOrderUp ? comparison : -comparison;
    });
    return sortedItems;
  }
}
