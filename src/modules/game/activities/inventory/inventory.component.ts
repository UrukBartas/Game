import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
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
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';
import { groupBy } from 'lodash';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ItemService } from 'src/services/item.service';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm.modal.component';
@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
})
export class InventoryComponent extends TemplatePage {
  private inventoryService = inject(InventoryService);
  private store = inject(Store);
  modalService = inject(BsModalService);
  private playerService = inject(PlayerService);
  private itemsService = inject(ItemService);
  viewportService = inject(ViewportService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  public activeSlideIndex = 0;
  public itemInventoryBoxes = this.inventoryService.getInventoryStructure();
  public consumablesInventoryBoxes =
    this.inventoryService.getInventoryStructure(20);

  public inventoryUpdated$ = new Subject();
  public sortOrderUp = false;
  public sortType: 'rarity' | 'level' = 'rarity';
  public currentInventory$ = this.playerService
    .getItems()
    .pipe(map((items) => this.sortInventory(items)));
  public currentConsumableInventory$ = this.playerService.getItemsConsumable();
  public activeDragAndDropItemType: ItemType = null;
  public itemTypePublic = ItemType;
  private spinnerService = inject(NgxSpinnerService);
  public groupByLodash = groupBy;
  public hoveredItem: Item;

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
      (player: PlayerModel) =>
        (this.itemInventoryBoxes = this.inventoryService.getInventoryStructure(
          player?.sockets ?? 80
        ))
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
    this.inventoryUpdated$.subscribe(() => {
      this.currentInventory$ = this.playerService
        .getItems()
        .pipe(map((items) => this.sortInventory(items)));
    });
  }

  private sortInventory(items: Item[]) {
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
        comparison =
          rarityOrder.indexOf(a.itemData.rarity) -
          rarityOrder.indexOf(b.itemData.rarity);
      }
      return this.sortOrderUp ? comparison : -comparison;
    });
    return sortedItems;
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
    this.playerService.equipItemFlow(item, () => {
      this.inventoryUpdated$.next(true);
    });
  }

  public onHoverItem(item: Item) {
    this.hoveredItem = item;
    console.log(item)
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

  changeSortOrder() {
    this.sortOrderUp = !this.sortOrderUp;
    this.inventoryUpdated$.next(true);
  }

  changeSortType() {
    this.sortType = this.sortType === 'rarity' ? 'level' : 'rarity';
    this.inventoryUpdated$.next(true);
  }

  public destroyItem(item: Item) {
    const config: ModalOptions = {
      initialState: {
        title: 'Destroy item',
        description: `This item will be destroyed forever. Do you want to proceed?`,
        accept: async () => {
          try {
            await firstValueFrom(
              this.itemsService.destroyItem(item.id).pipe(
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
}
