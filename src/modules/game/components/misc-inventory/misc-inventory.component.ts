import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  inject,
  signal,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Memoize } from 'lodash-decorators';
import { camelCase } from 'lodash-es';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import * as party from 'party-js';
import { firstValueFrom, map } from 'rxjs';
import { Item, ItemType, Rarity } from 'src/modules/core/models/items.model';
import {
  MiscellanyItem,
  MiscellanyItemData,
  MiscellanyItemIdentifier,
  MiscellanyItemIdentifierDisplay,
  MiscellanyItemType,
} from 'src/modules/core/models/misc.model';
import { BoostType } from 'src/modules/core/models/player.model';
import { StackPipe } from 'src/modules/core/pipes/stack.pipe';
import {
  fillInventoryBasedOnPlayerSockets,
  getGenericItemItemData,
  getMountTimeReductionByRarity,
  getRarityColor,
  getRarityText,
} from 'src/modules/utils';
import { ContextMenuService } from 'src/services/context-menu.service';
import { ItemService } from 'src/services/item.service';
import { MiscellanyService } from 'src/services/miscellany.service';
import { StatsService } from 'src/services/stats.service';
import { ViewportService } from 'src/services/viewport.service';
import { FocuserService } from 'src/standalone/focuser/focuser.service';
import { ItemRouletteComponent } from 'src/standalone/item-roulette/item-roulette.component';
import { MainState, RefreshPlayer } from 'src/store/main.store';
import { ItemTypeSC } from '../../activities/export-import-nft/enums/ItemTypesSC';
import { BaseInventoryComponent } from '../base-inventory/base-inventory.component';
import { ConfirmModalComponent } from '../confirm-modal/confirm.modal.component';

export interface MiscWithStack extends MiscellanyItem {
  stack?: number;
}

const mapItemTypesToReadable = {
  ...MiscellanyItemIdentifierDisplay,
  [Rarity.COMMON]: 'Common item',
  [Rarity.UNCOMMON]: 'Uncommon item',
  [Rarity.EPIC]: 'Epic item',
  [Rarity.LEGENDARY]: 'Legendary item',
  [Rarity.MYTHIC]: 'Mythic item',
};

@Component({
  selector: 'app-misc-inventory',
  templateUrl: './misc-inventory.component.html',
  styleUrl: './misc-inventory.component.scss',
})
export class MiscInventoryComponent extends BaseInventoryComponent {
  @Input() selectedItem: MiscWithStack;
  @Output() updateInventory = new EventEmitter<void>();
  @Output() equipMount = new EventEmitter<MiscellanyItem>();
  public currentPhase = 0;
  public currentPortraitPhase = 0;
  @ViewChild('lootboxOpener') lootboxOpener: TemplateRef<any>;
  @ViewChild('itemSetOpener') itemSetOpener: TemplateRef<any>;
  @ViewChild('portraitActivator') portraitActivator: TemplateRef<any>;
  @ViewChildren('itemRoulette') itemRoulettes: QueryList<ItemRouletteComponent>;
  @ViewChild('itemResult', { read: ElementRef }) itemResult: ElementRef;
  @ViewChild('portraitResult', { read: ElementRef }) portraitResult: ElementRef;
  @ViewChild('inventory', { read: ElementRef }) inventory: ElementRef;

  contextMenuService = inject(ContextMenuService);
  focuserService = inject(FocuserService);
  miscelanyService = inject(MiscellanyService);
  viewportService = inject(ViewportService);
  protected toast = inject(ToastrService);
  private cd = inject(ChangeDetectorRef);
  store = inject(Store);
  stats = inject(StatsService);
  stack = inject(StackPipe);
  itemService = inject(ItemService);
  openingItem = signal<MiscellanyItem>(null);
  modalService = inject(BsModalService);

  mapItemTypesToReadable = mapItemTypesToReadable;
  public camelCase = camelCase;
  quantityOpen = new FormControl(1);
  public getRarityColor = getRarityColor;
  public getRarityText = getRarityText;
  public getMountTimeReductionByRarity = getMountTimeReductionByRarity;

  public itemType = ItemTypeSC;
  public rolls: Array<{
    spinWheelItems: Array<any>;
    resultItem: any;
    bonusDrops: Array<any>;
  }> = null;

  public resultItemSet: Array<Item> = [];

  public miscItemFilterTypes = [
    {
      id: 1,
      image: '/assets/icons/boosts.png',
      type: [MiscellanyItemType.Boost],
    },
    {
      id: 2,
      image: '/assets/icons/boxes.png',
      type: [
        MiscellanyItemType.ComboLootbox,
        MiscellanyItemType.Lootbox,
        MiscellanyItemType.ItemSet,
        MiscellanyItemType.MoneyBag,
      ],
    },
    {
      id: 3,
      image: '/assets/icons/mounts.png',
      type: [MiscellanyItemType.Mount],
    },
    {
      id: 4,
      image: '/assets/icons/portraits.png',
      type: [MiscellanyItemType.Portrait],
    },
    {
      id: 5,
      image: '/assets/icons/scrolls.png',
      type: [MiscellanyItemType.Recipe],
    },
    {
      id: 6,
      image: '/assets/icons/siluette.png',
      type: [MiscellanyItemType.Silhouette],
    },
    {
      id: 7,
      image: '/assets/icons/titles.png',
      type: [MiscellanyItemType.Title_Prefix, MiscellanyItemType.Title_Suffix],
    },
  ];

  rarity = Rarity;
  public get filteredItems() {
    return fillInventoryBasedOnPlayerSockets(
      this.items
        .filter((item) => {
          if (!item) return false;
          const subTabFilterApplied =
            this.filteredItemTypes.includes(
              (item?.miscellanyItemData as MiscellanyItemData).itemType
            ) || this.filteredItemTypes.length == 0;
          return (
            item?.miscellanyItemData?.name
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase()) && subTabFilterApplied
          );
        })
        .sort(),
      this.sockets
    );
  }

  public getItem$ = (itemType: ItemType) => {
    const storeState = this.store.select(MainState.getState);
    return storeState.pipe(
      map((entry) => entry.player.items),
      map((items: Array<Item>) => {
        const foundItem = items.find(
          (item) => item.itemData.itemType == itemType && item.equipped
        );
        return foundItem;
      })
    );
  };

  getShowItemCompare(): boolean {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return true;
      case 'md':
      case 'xs':
      case 'sm':
      default:
        return false;
    }
  }

  public spinEndedHandle() {
    if (this.currentPhase == 1) {
      this.currentPhase = 2;
      setTimeout(() => {
        party.confetti(this.itemResult.nativeElement, {
          count: party.variation.range(20, 40),
        });
      }, 500);
      this.updateInventory.emit();
    }
  }

  public endPhases() {
    this.focuserService.close();
    this.currentPhase = 0;
  }

  public open(miscItem: MiscWithStack) {
    const { miscellanyItemData } = miscItem;
    if (miscellanyItemData.itemType == MiscellanyItemType.Recipe) return;
    if (miscellanyItemData.itemType == MiscellanyItemType.Boost) {
      this.activateBoost(miscItem);
    } else if (miscellanyItemData.itemType == MiscellanyItemType.Portrait) {
      this.activatePortrait(miscItem);
    } else if (miscItem.miscellanyItemData.itemType == 'Silhouette') {
      this.activeSilhouette(miscItem);
    } else if (
      miscItem.miscellanyItemData.itemType == 'Title_Prefix' ||
      miscItem.miscellanyItemData.itemType == 'Title_Suffix'
    ) {
      this.activateTitle(miscItem);
    } else if (miscellanyItemData.itemType == MiscellanyItemType.ItemSet) {
      this.openItemsSet(miscItem);
    } else if (miscellanyItemData.itemType == MiscellanyItemType.MoneyBag) {
      this.openBag(miscItem);
    } else if (miscellanyItemData.itemType == MiscellanyItemType.Mount) {
      this.equipMount.emit(miscItem);
    } else {
      this.openingItem.set(miscItem);
      this.focuserService.open(this.lootboxOpener, miscItem);
    }
  }

  public async openBag(miscLootbox: MiscWithStack) {
    try {
      await firstValueFrom(this.miscelanyService.openMoneyBag(miscLootbox.id));
      setTimeout(() => {
        party.confetti(this.inventory.nativeElement, {
          count: party.variation.range(20, 40),
        });
      }, 500);
      this.toast.success(
        `You received ${MiscellanyItemIdentifierDisplay[miscLootbox.miscellanyItemDataId]} Golden Uruks`,
        'You opened a money bag!'
      );
      this.updateInventory.emit();
      this.store.dispatch(new RefreshPlayer());
    } catch (error) {
      this.toast.error(`Error opening the money bag ${error}`);
      this.updateInventory.emit();
    }
  }

  public async openItemsSet(miscLootbox: MiscWithStack) {
    const allPossibleItems = await firstValueFrom(
      this.itemService.getItemDataByRarity(
        miscLootbox.miscellanyItemData.rarity
      )
    );
    this.openingItem.set(miscLootbox);
    this.focuserService.open(this.itemSetOpener, {
      lootbox: miscLootbox,
      possibleResults: allPossibleItems,
    });
  }

  public async openItemsSetBox() {
    try {
      this.resultItemSet = await firstValueFrom(
        this.miscelanyService.openItemsSet(this.openingItem().id)
      );
      this.currentPhase = 1;
      this.updateInventory.emit();
      this.store.dispatch(new RefreshPlayer());
    } catch (error) {
      this.toast.error(`Error opening the item set ${error}`);
      this.updateInventory.emit();
    }
  }

  public activatePortrait(miscPortrait: MiscWithStack) {
    this.currentPortraitPhase = 0;
    this.focuserService.open(this.portraitActivator, miscPortrait);
  }

  public async activeSilhouette(miscSilhouette: MiscWithStack) {
    await firstValueFrom(
      this.miscelanyService.activateSilhouette(miscSilhouette.id)
    );
    setTimeout(() => {
      party.confetti(document.body, {
        count: party.variation.range(20, 40),
      });
    }, 500);
    this.toast.success(
      'Silhouette ' + miscSilhouette.miscellanyItemData.name + ' activated!'
    );
    this.updateInventory.emit();
    this.store.dispatch(new RefreshPlayer());
  }

  public async activateTitle(misc: MiscWithStack) {
    await firstValueFrom(this.miscelanyService.activateTitle(misc.id));
    setTimeout(() => {
      party.confetti(document.body, {
        count: party.variation.range(20, 40),
      });
    }, 500);
    this.updateInventory.emit();
    this.store.dispatch(new RefreshPlayer());
    this.toast.success('Title ' + misc.miscellanyItemData.name + ' activated!');
  }

  private getActiveBootType(
    boostIdentifier: MiscellanyItemIdentifier
  ): BoostType {
    return boostIdentifier.split('_')[1].toUpperCase() as BoostType;
  }

  confirmOverride() {
    return new Promise((resolve, reject) => {
      const config: ModalOptions = {
        initialState: {
          title: 'You have already this boost activated!',
          description: `If you continue, you will override the current one. Proceed anyway?`,
          accept: async () => {
            modalRef.hide();
            resolve(true);
          },
          cancel: () => {
            resolve(false);
          },
        },
      };
      const modalRef = this.modalService.show(ConfirmModalComponent, config);
    }) as Promise<boolean>;
  }

  public async activateBoost(miscBoost: MiscWithStack) {
    try {
      const currentPlayer = await firstValueFrom(
        this.store.select(MainState.getState).pipe(map((e) => e.player))
      );
      const activatingBoostType = this.getActiveBootType(
        miscBoost.miscellanyItemDataId
      );
      const overridingABost = !!currentPlayer.boosts.find(
        (e) => e.type == activatingBoostType && !e.mineBoost
      );
      if (overridingABost) {
        const result = await this.confirmOverride();
        if (!result) {
          this.toast.info('Discarded');
          this.updateInventory.emit();
          this.store.dispatch(new RefreshPlayer());
          return;
        }
      }
      await firstValueFrom(this.miscelanyService.activateBoost(miscBoost.id));
      setTimeout(() => {
        party.confetti(this.inventory.nativeElement, {
          count: party.variation.range(20, 40),
        });
      }, 500);
      this.toast.success('You activated a boost!');
      this.updateInventory.emit();
      this.store.dispatch(new RefreshPlayer());
    } catch (error) {
      this.toast.error(`Error activating the boost ${error}`);
      this.updateInventory.emit();
    }
  }

  public async confirmActivationPortrait(miscPortrait: MiscWithStack) {
    await firstValueFrom(
      this.miscelanyService.activatePortrait(miscPortrait.id)
    );
    this.currentPortraitPhase = 1;
    setTimeout(() => {
      party.confetti(this.portraitResult.nativeElement, {
        count: party.variation.range(20, 40),
      });
    }, 500);
  }

  public closePortrait() {
    this.focuserService.close();
    this.currentPortraitPhase = 0;
    this.store.dispatch(new RefreshPlayer());
    this.updateInventory.emit();
  }

  public async runRoulette(idLootbox: number) {
    this.currentPhase = 1;
    try {
      const result = await firstValueFrom(
        this.miscelanyService.openLootbox(idLootbox, this.quantityOpen.value)
      );
      this.rolls = result;
      this.cd.detectChanges();
      this.quantityOpen.reset(1);
      setTimeout(() => {
        this.itemRoulettes.forEach((roulette, index) => {
          setTimeout(() => {
            roulette.startRoulette();
          }, 100 * index);
        });
      }, 0);
    } catch (error) {
      this.currentPhase = 0;
    }
  }

  public parseDistributions(distributions: any) {
    const rarity = this.openingItem().miscellanyItemData.rarity;
    if (!rarity || !distributions) return null;
    return Object.entries(distributions[rarity]);
  }

  @Memoize()
  public getGenericItemItemData(item: any) {
    return getGenericItemItemData(item);
  }

  @Memoize()
  public getGenericItemsItemData(rolls: Array<any> = []) {
    const itemsData = (rolls ?? []).map(
      (entry) => getGenericItemItemData(entry.resultItem).name
    );
    return itemsData.join(', ');
  }

  getResponsiveButtonSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return '0.8em 3em';
      case 'md':
        return '0.4em 1.5em';
      case 'xs':
      case 'sm':
      default:
        return '0.3em 1em';
    }
  }

  getPossibleDropsSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 100;
      default:
        return 50;
    }
  }

  getFonsSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 22;
      default:
        return 10;
    }
  }
}
