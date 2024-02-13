import { Component, HostListener, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { DndDropEvent } from 'ngx-drag-drop';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  BehaviorSubject,
  Observable,
  Subject,
  filter,
  firstValueFrom,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { Item, ItemType } from 'src/modules/core/models/items.model';
import { InventoryService } from 'src/services/inventory.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
})
export class InventoryComponent extends TemplatePage {
  private inventoryService = inject(InventoryService);
  private store = inject(Store);
  private playerService = inject(PlayerService);
  viewportService = inject(ViewportService);
  public activeSlideIndex = 0;
  public itemInventoryBoxes = this.inventoryService.getInventoryStructure();
  public consumablesInventoryBoxes =
    this.inventoryService.getInventoryStructure(20);

  public inventoryUpdated$ = new Subject();
  public currentInventory$ = this.playerService.getItems();
  public activeDragAndDropItemType: ItemType = null;
  public itemTypePublic = ItemType;
  private spinnerService = inject(NgxSpinnerService);

  public toItem = (anything: unknown) => {
    return anything as Item;
  };

  public getItem$ = (itemType: ItemType) => {
    return this.store.select(MainState.getState).pipe(
      map((store) => store.player.items),
      map((items) => {
        const foundItem = items.find(
          (item) => item.itemData.itemType == itemType
        );
        return foundItem;
      })
    );
  };

  public getHelmet$ = this.getItem$(ItemType.Helmet);
  public getShield$ = this.getItem$(ItemType.Shield);
  public getChest$ = this.getItem$(ItemType.Chest);
  public getWeapon$ = this.getItem$(ItemType.Weapon);
  public getTrousers$ = this.getItem$(ItemType.Trousers);
  public getBoots$ = this.getItem$(ItemType.Boots);
  public getGloves$ = this.getItem$(ItemType.Gloves);
  public getCharm$ = this.getItem$(ItemType.Charm);
  public getRing$ = this.getItem$(ItemType.Ring);

  constructor() {
    super();

    this.inventoryUpdated$.subscribe(() => {
      this.currentInventory$ = this.playerService.getItems();
    });
  }

  public obtainEquippedItemBoxHeightDependingOnScreenSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 70;
    }
    return 140;
  }

  public obtainEquippedItemBoxWidthDependingOnScreenSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 62.5;
    }
    return 125;
  }

  public async unEquipItem(item$: Observable<Item>) {
    this.spinnerService.show();
    try {
      const item = await firstValueFrom(item$);
      await firstValueFrom(
        this.playerService.unEquipItem(item).pipe(
          tap(() => {
            this.store.dispatch(new RefreshPlayer());
            this.inventoryUpdated$.next(true);
          })
        )
      );
      this.spinnerService.hide();
    } catch (error) {
      this.spinnerService.hide();
    }
  }

  public async equipItem(item: Item) {
    try {
      this.spinnerService.show();
      await firstValueFrom(
        this.playerService.equipItem(item).pipe(
          tap(() => {
            this.store.dispatch(new RefreshPlayer());
            this.inventoryUpdated$.next(true);
          })
        )
      );
      this.spinnerService.hide();
    } catch (error) {
      this.spinnerService.hide();
    }
  }

  onDrop(event: DndDropEvent) {
    const item = event.data as Item;
    this.equipItem(item);
  }

  onDragStart(event: DragEvent, item: Item) {
    this.activeDragAndDropItemType = item.itemData.itemType;
  }

  onDragEnd(event: DragEvent) {
    this.activeDragAndDropItemType = null;
  }
}
