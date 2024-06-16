import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { Item, ItemType, Rarity } from 'src/modules/core/models/items.model';
import { MiscellanyItem } from 'src/modules/core/models/misc.model';
import { fillInventoryBasedOnPlayerSockets } from 'src/modules/utils';
import { ContextMenuService } from 'src/services/context-menu.service';
import { FocuserService } from 'src/standalone/focuser/focuser.service';
import { MiscellanyService } from 'src/services/miscellany.service';
import { ItemRouletteComponent } from 'src/standalone/item-roulette/item-roulette.component';
import { firstValueFrom, map } from 'rxjs';
import * as party from 'party-js';
import { Store } from '@ngxs/store';
import { MainState } from 'src/store/main.store';
import { ViewportService } from 'src/services/viewport.service';
import { BaseInventoryComponent } from '../base-inventory/base-inventory.component';
import { StackPipe } from 'src/modules/core/pipes/stack.pipe';
export interface MiscWithStack extends MiscellanyItem {
  stack?: number;
}
@Component({
  selector: 'app-misc-inventory',
  templateUrl: './misc-inventory.component.html',
  styleUrl: './misc-inventory.component.scss',
})
export class MiscInventoryComponent extends BaseInventoryComponent {
  @Input() selectedItem: MiscWithStack;
  @Output() updateInventory = new EventEmitter<void>();
  public currentPhase = 0;
  @ViewChild('lootboxOpener') lootboxOpener: TemplateRef<any>;
  @ViewChild('itemRoulette') itemRoulette: ItemRouletteComponent;
  @ViewChild('itemResult', { read: ElementRef }) itemResult: ElementRef;

  contextMenuService = inject(ContextMenuService);
  focuserService = inject(FocuserService);
  miscelanyService = inject(MiscellanyService);
  viewportService = inject(ViewportService);
  store = inject(Store);
  stack = inject(StackPipe);

  public roll: {
    spinWheelItems: Array<Item>;
    resultItem: Item;
  } = null;

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
    this.focuserService.open(this.lootboxOpener, miscLootbox);
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
}
