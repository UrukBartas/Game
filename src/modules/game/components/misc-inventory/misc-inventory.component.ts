import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Item, ItemType, Rarity } from 'src/modules/core/models/items.model';
import {
  MiscellanyItem,
  MiscellanyItemIdentifier,
  MiscellanyItemIdentifierDisplay,
  MiscellanyItemType,
} from 'src/modules/core/models/misc.model';
import {
  fillInventoryBasedOnPlayerSockets,
  getGenericItemItemData,
  getRarityColor,
  getRarityText,
} from 'src/modules/utils';
import { ContextMenuService } from 'src/services/context-menu.service';
import { FocuserService } from 'src/standalone/focuser/focuser.service';
import { MiscellanyService } from 'src/services/miscellany.service';
import { ItemRouletteComponent } from 'src/standalone/item-roulette/item-roulette.component';
import { firstValueFrom, map } from 'rxjs';
import * as party from 'party-js';
import { Store } from '@ngxs/store';
import { MainState, RefreshPlayer } from 'src/store/main.store';
import { ViewportService } from 'src/services/viewport.service';
import { BaseInventoryComponent } from '../base-inventory/base-inventory.component';
import { StackPipe } from 'src/modules/core/pipes/stack.pipe';
import { StatsService } from 'src/services/stats.service';
import { camelCase } from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { ItemService } from 'src/services/item.service';
import { ItemTypeSC } from '../../activities/export-import-nft/enums/ItemTypesSC';
import { Memoize } from 'lodash-decorators';
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
  public currentPhase = 0;
  public currentPortraitPhase = 0;
  @ViewChild('lootboxOpener') lootboxOpener: TemplateRef<any>;
  @ViewChild('itemSetOpener') itemSetOpener: TemplateRef<any>;
  @ViewChild('portraitActivator') portraitActivator: TemplateRef<any>;
  @ViewChild('itemRoulette') itemRoulette: ItemRouletteComponent;
  @ViewChild('itemResult', { read: ElementRef }) itemResult: ElementRef;
  @ViewChild('portraitResult', { read: ElementRef }) portraitResult: ElementRef;

  @ViewChild('inventory', { read: ElementRef }) inventory: ElementRef;

  contextMenuService = inject(ContextMenuService);
  focuserService = inject(FocuserService);
  miscelanyService = inject(MiscellanyService);
  viewportService = inject(ViewportService);
  protected toast = inject(ToastrService);
  store = inject(Store);
  stats = inject(StatsService);
  stack = inject(StackPipe);
  itemService = inject(ItemService);
  openingItem = signal<MiscellanyItem>(null);
  lootboxPossibilities$ = computed(() => {
    return this.stats.lootboxPossibilities(
      this.openingItem().miscellanyItemData.itemType
    );
  });
  mapItemTypesToReadable = mapItemTypesToReadable;
  public camelCase = camelCase;
  public getRarityColor = getRarityColor;
  public getRarityText = getRarityText;

  public itemType = ItemTypeSC;
  public roll: {
    spinWheelItems: Array<any>;
    resultItem: any;
    bonusDrops: Array<any>;
  } = null;

  public resultItemSet: Array<Item> = [];
  public pathPortrait = 'assets/premium-portraits/5.webp';
  public pathMaterial = 'assets/materials/38.webp';

  rarity = Rarity;
  public get filteredItems() {
    return fillInventoryBasedOnPlayerSockets(
      this.stack
        .transform(this.items, 'miscellanyItemData.name')
        .filter((item) =>
          item?.miscellanyItemData?.name
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        )
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

  public open(miscLootbox: MiscWithStack) {
    this.openingItem.set(miscLootbox);
    this.focuserService.open(this.lootboxOpener, miscLootbox);
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
      this.toast.success(`Error opening the money bag ${error}`);
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
      this.toast.success(`Error opening the item set ${error}`);
      this.updateInventory.emit();
    }
  }

  public activatePortrait(miscPortrait: MiscWithStack) {
    this.currentPortraitPhase = 0;
    this.focuserService.open(this.portraitActivator, miscPortrait);
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
    this.updateInventory.emit();
  }

  public async runRoulette(idLootbox: number) {
    this.currentPhase = 1;
    const result = await firstValueFrom(
      this.miscelanyService.openLootbox(idLootbox)
    );
    this.roll = result;
    setTimeout(() => {
      this.itemRoulette.startRoulette();
    }, 0);
  }

  public parseDistributions(distributions: any) {
    const rarity = this.openingItem().miscellanyItemData.rarity;
    if (!rarity || !distributions) return null;
    return Object.entries(distributions[rarity]);
  }
  @Memoize()
  public parsePossibilities(itemPossibilities: any) {
    const rarity = this.openingItem().miscellanyItemData.rarity;
    if (!rarity || !itemPossibilities) return null;
    return Object.keys(itemPossibilities[rarity])
      .map((key) => {
        return {
          rarity: key as Rarity,
          value: itemPossibilities[rarity][key] as number,
          image: this.getImageBasedOnType('ITEM', key as Rarity),
        };
      })
      .filter((entry) => entry.value > 0);
  }
  public getImageBasedOnType(
    itemType: 'ITEM' | 'MoneyBag' | 'ItemSet',
    rarity: Rarity,
    key?: string
  ): string {
    let path = '';
    let possibleItems = Object.keys(ItemType).map((itemType) =>
      itemType.toLowerCase()
    );

    if (itemType == 'ITEM') {
      const randomIndex = Math.floor(Math.random() * possibleItems.length);
      let randomItem = possibleItems[randomIndex];
      if (randomItem.toLowerCase().includes('weapon')) {
        randomItem = 'weapon';
      }
      path = `assets/items/${randomItem}/${rarity.toLowerCase()}/1.webp`;
    } else if (itemType == 'MoneyBag') {
      const mapMoneyBags = {
        MoneyBag500: 'medium_bag_money.png',
        MoneyBag1000: 'big_bag_money.png',
        MoneyBag100: 'small_bag.png',
      };
      path = `assets/misc/bags/${mapMoneyBags[key]}`;
    } else if (itemType == 'ItemSet') {
      const mapItemSets = {
        CommonItemPackage: 'coommon_package_box.webp',
        UncommonItemPackage: 'uncommon_package_box.webp',
        EpicItemPackage: 'epic_package_box.webp',
        LegendaryItemPackage: 'legendary_package_box.webp',
        MythicItemPackage: 'mythic_package_box.webp',
      };
      path = `assets/misc/packages/${mapItemSets[key]}`;
    }

    return path;
  }
  @Memoize()
  public parsePossibilitiesComboBox(possibilities: any) {
    if (!possibilities) return null;
    const rarity = this.openingItem().miscellanyItemData.rarity;
    const drops = possibilities[rarity].drop;
    const result = {
      Portraits: 0,
      Materials: 0,
      Others: [] as any[],
      Bonus: possibilities[rarity]?.bonusDrop?.length ?? 0,
    };

    Object.keys(drops).forEach((key) => {
      const item = drops[key];
      if (item.type === 'Portrait') {
        result.Portraits += item.chance;
      } else if (item.type === 'MATERIAL') {
        result.Materials += item.chance;
      } else {
        result.Others.push({
          key: key,
          rarity: item.rarity,
          value: item.chance,
          type: item.type,
          image: this.getImageBasedOnType(
            item.type,
            item.rarity as Rarity,
            key
          ),
        });
      }
    });

    result.Others.sort((a, b) => b.value - a.value);
    return result;
  }
  @Memoize()
  public getGenericItemItemData(item: any) {
    return getGenericItemItemData(item);
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
