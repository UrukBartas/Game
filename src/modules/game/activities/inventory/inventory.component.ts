import { Component, inject, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { groupBy } from 'lodash';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { DndDropEvent } from 'ngx-drag-drop';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  BehaviorSubject,
  filter,
  firstValueFrom,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { Item, ItemType, Rarity } from 'src/modules/core/models/items.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { InventoryService } from 'src/services/inventory.service';
import { ItemService } from 'src/services/item.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm.modal.component';
import { ShopService } from 'src/services/shop.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Material } from 'src/modules/core/models/material.model';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class InventoryComponent extends TemplatePage {
  private inventoryService = inject(InventoryService);
  private store = inject(Store);
  modalService = inject(BsModalService);
  private playerService = inject(PlayerService);
  private itemService = inject(ItemService);
  viewportService = inject(ViewportService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  public activeSlideIndex = 0;
  public maxLevel = 10;
  public itemInventoryBoxes = this.inventoryService.getInventoryStructure();
  public consumablesInventoryBoxes =
    this.inventoryService.getInventoryStructure();
  public materialsInventoryBoxes =
    this.inventoryService.getInventoryStructure();

  public currentSize$ = this.store.select(MainState.getState).pipe(
    filter((player) => !!player),
    map((entry) => entry.player.sockets)
  );
  //Level 4 is the default level. 80 is default socket size / 20 = 4. If it buys another it becomes 5 (100 /20)
  public currentLevel$ = this.currentSize$.pipe(map((sockets) => sockets / 20));

  public inventoryUpdated$ = new Subject();
  public materialUpdated$ = new Subject();
  public currentInventory: Array<Item> = [];
  public currentMaterials: Array<Material> = [];

  public currentConsumableInventory$ = this.playerService.getItemsConsumable();
  public activeDragAndDropItemType: ItemType = null;
  public itemTypePublic = ItemType;
  private spinnerService = inject(NgxSpinnerService);
  public groupByLodash = groupBy;
  public hoveredItem: Item;
  private shopService = inject(ShopService);

  public getPlayer$ = of(true).pipe(
    switchMap(() => {
      if (this.isViewingPlayer) {
        return this.playerService.getPlayerByAddress(
          this.route.snapshot.paramMap.get('id')
        );
      } else {
        return this.store
          .select(MainState.getState)
          .pipe(map((entry) => entry.player));
      }
    }),
    tap(
      () =>
        (this.itemInventoryBoxes =
          this.inventoryService.getInventoryStructure())
    )
  );
  public actualPlayer$ = new BehaviorSubject<PlayerModel>(null);

  public toItem = (anything: unknown) => {
    return anything as Item;
  };

  public getItem$ = (itemType: ItemType) => {
    return this.actualPlayer$.pipe(
      filter((player) => !!player),
      map((player) => player.items),
      map((items: Array<Item>) => {
        const foundItem = items.find(
          (item) => item.itemData.itemType == itemType && item.equipped
        );
        return foundItem;
      })
    );
  };

  public getHelmet$ = this.getItem$(ItemType.HELMET);
  public getShield$ = this.getItem$(ItemType.SHIELD);
  public getChest$ = this.getItem$(ItemType.CHEST);
  public getWeapon$ = this.getItem$(ItemType.WEAPON);
  public getTrousers$ = this.getItem$(ItemType.TROUSERS);
  public getBoots$ = this.getItem$(ItemType.BOOTS);
  public getGloves$ = this.getItem$(ItemType.GLOVES);
  public getCharm$ = this.getItem$(ItemType.CHARM);
  public getRing$ = this.getItem$(ItemType.RING);

  public isViewingPlayer =
    this.route.snapshot.url[0].path.includes('view-player');

  constructor() {
    super();
    if (this.isViewingPlayer) this.activeSlideIndex = 1;
    this.getPlayer$.subscribe((player) => {
      this.actualPlayer$.next(player);
    });
    this.inventoryUpdated$.pipe(takeUntilDestroyed()).subscribe(async () => {
      this.currentInventory = await firstValueFrom(
        this.playerService.getItems()
      );
    });
    this.materialUpdated$.pipe(takeUntilDestroyed()).subscribe(async () => {
      this.currentMaterials = await firstValueFrom(
        this.playerService.getItemsMaterial()
      );
    });
    this.inventoryUpdated$.next(true);
    this.materialUpdated$.next(true);
  }

  public getEquippedItemBoxSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 70;
    }
    return 140;
  }

  public async unEquipItem(item$: Observable<Item>) {
    this.spinnerService.show();
    try {
      const item = await firstValueFrom(item$);
      await firstValueFrom(
        this.itemService.unEquipItem(item).pipe(
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
    this.playerService.equipItemFlow(item, () => {
      this.inventoryUpdated$.next(true);
    });
  }

  public onHoverItem(item: Item) {
    this.hoveredItem = item;
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

  public destroyItem(item: Item) {
    const config: ModalOptions = {
      initialState: {
        title: 'Destroy item',
        description: `This item will be destroyed forever. Do you want to proceed?`,
        accept: async () => {
          try {
            await firstValueFrom(
              this.itemService.destroyItem(item.id).pipe(
                tap(() => {
                  this.store.dispatch(new RefreshPlayer());
                  this.inventoryUpdated$.next(true);
                })
              )
            );
          } catch (error) {
            console.error(error);
          }

          modalRef.hide();
        },
      },
    };
    const modalRef = this.modalService.show(ConfirmModalComponent, config);
  }

  public confirmPurchase() {
    const config: ModalOptions = {
      initialState: {
        title: 'Purchase',
        description: `This will add 20 more slots to your inventory. Do you want to proceed?`,
        accept: async () => {
          try {
            await firstValueFrom(this.shopService.buyInventoryExpand());
            this.store.dispatch(new RefreshPlayer());
          } catch (error) {
            console.error(error);
          }

          modalRef.hide();
        },
      },
    };
    const modalRef = this.modalService.show(ConfirmModalComponent, config);
  }
}
