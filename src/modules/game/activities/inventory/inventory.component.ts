import { Component, inject, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { Store } from '@ngxs/store';
import { groupBy } from 'lodash-es';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { DndDropEvent } from 'ngx-drag-drop';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import {
  BehaviorSubject,
  filter,
  firstValueFrom,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { Item, ItemType, Rarity } from 'src/modules/core/models/items.model';
import { Material } from 'src/modules/core/models/material.model';
import {
  MiscellanyItem,
  MiscellanyItemIdentifier,
} from 'src/modules/core/models/misc.model';
import { ItemSet, PlayerModel } from 'src/modules/core/models/player.model';
import {
  getIRIFromCurrentPlayer,
  getMountTimeReductionByRarity,
  getRarityBasedOnIRI,
  getRarityColor,
  getRarityText,
  globalCalculatedStackRule,
} from 'src/modules/utils';
import { ContextMenuService } from 'src/services/context-menu.service';
import { ItemService } from 'src/services/item.service';
import { MiscellanyService } from 'src/services/miscellany.service';
import { PlayerService } from 'src/services/player.service';
import { ShopService } from 'src/services/shop.service';
import { ViewportService } from 'src/services/viewport.service';
import { WalletService } from 'src/services/wallet.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm.modal.component';
import { TitleGeneratorModalComponent } from '../../components/title-generator-modal/title-generator-modal.component';
import { ItemSetModalComponent } from './item-set-modal/item-set-modal.component';
import { InventoryUpdateService } from './services/inventory-update.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class InventoryComponent extends TemplatePage {
  private store = inject(Store);
  modalService = inject(BsModalService);
  private playerService = inject(PlayerService);
  private itemService = inject(ItemService);
  viewportService = inject(ViewportService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  public miscService = inject(MiscellanyService);
  public inventoryUpdateService = inject(InventoryUpdateService);
  toastService = inject(ToastrService);
  contextMenuService = inject(ContextMenuService);
  walletService = inject(WalletService);
  public activeSlideIndex = 0;
  public maxLevel = 10;
  calculatedStackRule = globalCalculatedStackRule;
  public currentSize$ = this.store.select(MainState.getState).pipe(
    filter((player) => !!player),
    map((entry) => entry?.player?.sockets)
  );
  public selectedItemSet!: ItemSet;
  containerExpanded = false;
  public prefix = ViewportService.getPreffixImg();

  public async activateSilhouette(id: MiscellanyItemIdentifier) {
    const set = await firstValueFrom(this.miscService.setSilhouette(id));
    this.store.dispatch(new RefreshPlayer());
  }

  public openTitleSelector() {
    this.modalService.show(TitleGeneratorModalComponent);
  }

  public siluettes$ = this.store.select(MainState.getState).pipe(
    filter((player) => !!player),
    switchMap(() => {
      return this.miscService.getSilhouettes().pipe(
        map((e) => {
          return [
            ...e,
            {
              id: -1 as any,
              imageLocal: '/assets/siluette.png',
              rarity: Rarity.COMMON,
            },
          ];
        })
      );
    })
  );

  //Level 4 is the default level. 80 is default socket size / 20 = 4. If it buys another it becomes 5 (100 /20)
  public currentLevel$ = this.currentSize$.pipe(map((sockets) => sockets / 20));

  public inventoryUpdated$ = new Subject();
  public materialUpdated$ = new Subject();
  public miscUpdated$ = new Subject();
  public consumablesUpdated$ = new Subject();
  public currentInventory: Array<Item> = [];
  public currentMaterials: Array<Material> = [];
  public currentConsumableInventory = [];
  public currentMiscInventory = [];

  public activeDragAndDropItemType: ItemType = null;
  public itemTypePublic = ItemType;
  private spinnerService = inject(NgxSpinnerService);
  public groupByLodash = groupBy;
  public hoveredItem: Item;
  private shopService = inject(ShopService);

  public getRarityColor = getRarityColor;
  public getRarityText = getRarityText;
  public getRarityBasedOnIRI = getRarityBasedOnIRI;
  public getMountTimeReductionByRarity = getMountTimeReductionByRarity;

  public getPlayer$: Observable<PlayerModel> = of(true).pipe(
    switchMap(() => {
      if (this.isViewingPlayer) {
        return this.playerService.getPlayerByAddress(
          this.route.snapshot.paramMap.get('id')
        );
      } else {
        return this.store.select(MainState.getPlayer);
      }
    })
  );
  public actualPlayer$ = new BehaviorSubject<PlayerModel>(null);

  public toItem = (anything: unknown) => {
    return anything as Item;
  };

  public getItem$ = (itemTypes: ItemType[], slotType: ItemType) => {
    return this.actualPlayer$.pipe(
      filter((player) => !!player),
      map((player) => player.items),
      map((items: Array<Item>) => {
        const foundItem = items.find(
          (item) =>
            itemTypes.includes(item.itemData.itemType) &&
            item.equipped &&
            (item.slotEquipped == slotType ||
              !item.slotEquipped ||
              (item.itemData.itemType == ItemType.Weapon2H &&
                slotType == ItemType.Weapon1H))
        );
        return foundItem;
      })
    );
  };

  public iriAverage$ = () => {
    return this.actualPlayer$.pipe(
      filter((player) => !!player),
      map((player) => getIRIFromCurrentPlayer(player))
    );
  };

  public itemSets$ = this.actualPlayer$.pipe(
    switchMap(() => {
      return this.playerService.getItemSets().pipe(
        map((entries) => {
          return [...entries, ...[null, null, null, null]].slice(0, 4);
        })
      );
    })
  );

  public getHelmet$ = this.getItem$([ItemType.HELMET], ItemType.HELMET);
  public getShield$ = this.getItem$(
    [ItemType.SHIELD, ItemType.Weapon1H],
    ItemType.SHIELD
  );
  public getChest$ = this.getItem$([ItemType.CHEST], ItemType.CHEST);
  public getWeapon$ = this.getItem$(
    [ItemType.Weapon1H, ItemType.Weapon2H],
    ItemType.Weapon1H
  );
  public getTrousers$ = this.getItem$([ItemType.TROUSERS], ItemType.TROUSERS);
  public getBoots$ = this.getItem$([ItemType.BOOTS], ItemType.BOOTS);
  public getGloves$ = this.getItem$([ItemType.GLOVES], ItemType.GLOVES);
  public getCharm$ = this.getItem$([ItemType.CHARM], ItemType.CHARM);
  public getRing$ = this.getItem$([ItemType.RING], ItemType.RING);

  public isViewingPlayer =
    this.route.snapshot.url[0].path.includes('view-player');

  constructor() {
    super();
    if (this.isViewingPlayer) this.activeSlideIndex = 1;
    this.getPlayer$.subscribe((player) => {
      this.actualPlayer$.next(player);
    });
    if (!this.isViewingPlayer) {
      this.setupInventories();
    }
    this.inventoryUpdateService.updateAllInventory$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadInventories());
  }

  ngAfterViewInit(): void {
    this.walletService.getValidAddress$.subscribe(async (address) => {
      const prefsWithAddress = await Preferences.get({ key: address });
      if (prefsWithAddress && prefsWithAddress.value) {
        const { presale } = JSON.parse(prefsWithAddress.value);
        if (presale && presale.timestamp) {
          const currentTime = Date.now();
          const tenMinutesInMs = 10 * 60 * 1000;
          if (currentTime - presale.timestamp > tenMinutesInMs) {
            await Preferences.remove({ key: address });
          } else {
            this.router.navigate(['export-import'], {
              queryParams: {
                navigateToTab: 3,
                importMode: true,
                exporObjectType: 'nft',
              },
            });
            await Preferences.remove({ key: address });
          }
        }
      }
    });
    this.route.queryParams.pipe(take(1)).subscribe((queryParams) => {
      const { tab } = queryParams;
      if (!!tab) {
        this.activeSlideIndex = Number(tab);
      }
    });
  }

  private setupInventories() {
    this.inventoryUpdated$.pipe(takeUntilDestroyed()).subscribe(async () => {
      this.currentInventory = await firstValueFrom(
        this.playerService.getItems()
      );
    });
    this.consumablesUpdated$.pipe(takeUntilDestroyed()).subscribe(async () => {
      this.currentConsumableInventory = await firstValueFrom(
        this.playerService.getItemsConsumable()
      );
    });
    this.materialUpdated$.pipe(takeUntilDestroyed()).subscribe(async () => {
      this.currentMaterials = await firstValueFrom(
        this.playerService.getItemsMaterial()
      );
    });
    this.miscUpdated$.pipe(takeUntilDestroyed()).subscribe(async () => {
      this.currentMiscInventory = await firstValueFrom(
        this.playerService.getMiscellanyItems()
      );
    });
    this.loadInventories();
  }

  private loadInventories() {
    this.inventoryUpdated$.next(true);
    this.consumablesUpdated$.next(true);
    this.materialUpdated$.next(true);
    this.miscUpdated$.next(true);
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

  public async equipSet(itemSet: ItemSet) {
    await firstValueFrom(this.playerService.equipItemSet(itemSet.id));
    this.selectedItemSet = itemSet;
    this.store.dispatch(new RefreshPlayer());
    this.loadInventories();
  }

  public async deleteSet(itemSet: ItemSet) {
    await firstValueFrom(this.playerService.deleteItemSet(itemSet.id));
    this.store.dispatch(new RefreshPlayer());
    this.loadInventories();
  }

  public async saveSet(itemSet?: ItemSet) {
    let config: ModalOptions = {};
    if (itemSet) {
      const updated = await firstValueFrom(
        this.playerService.updateItemSet(
          itemSet.id,
          itemSet.name,
          this.actualPlayer$
            .getValue()
            .items.filter((entry) => !!entry.equipped)
            .map((entry) => entry.id)
        )
      );
      this.toastService.success('Item preset updated!');
      this.store.dispatch(new RefreshPlayer());
      this.loadInventories();
    } else {
      config = {
        initialState: {
          title: 'Create new item preset',
          description: `This action will save your current item equipped set.
          Do you want to proceed?`,
          accept: async (name: string) => {
            try {
              const newPreset = await firstValueFrom(
                this.playerService.createItemSet(
                  name,
                  this.actualPlayer$
                    .getValue()
                    .items.filter((entry) => !!entry.equipped)
                    .map((entry) => entry.id)
                )
              );
              this.toastService.success(
                'New preset with name ' + newPreset.name + ' created'
              );
              this.store.dispatch(new RefreshPlayer());
              this.loadInventories();
            } catch (error) {
              console.error(error);
            }

            modalRef.hide();
          },
        },
      };
      const modalRef = this.modalService.show(ItemSetModalComponent, config);
    }
  }

  public getDisplayedItemSet(itemSet: ItemSet) {
    if (['xs', 'sm'].includes(this.viewportService.screenSize)) {
      return (itemSet.name.length > 1 ? itemSet.name.slice(0, 1) : itemSet.name)
        .trim()
        .toUpperCase();
    }
    return (itemSet.name.length > 3 ? itemSet.name.slice(0, 3) : itemSet.name)
      .trim()
      .toUpperCase();
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

  public async equipItem(item: Item, equipType: ItemType) {
    this.playerService.equipItemFlow(
      this.itemService.equipItem(item, equipType),
      () => {
        this.inventoryUpdated$.next(true);
      }
    );
  }

  public onHoverItem(item: Item) {
    this.hoveredItem = item;
  }

  public equipMount(mount: MiscellanyItem) {
    this.playerService.equipItemFlow(
      this.playerService.equipMount(mount?.id),
      () => {
        this.miscUpdated$.next(true);
      }
    );
  }

  onDrop(event: DndDropEvent, equipType: ItemType) {
    const droppingItem = event.data as Item;
    this.equipItem(droppingItem, equipType);
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
