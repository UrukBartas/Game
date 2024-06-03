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
import { BehaviorSubject, filter, firstValueFrom, map } from 'rxjs';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { Store } from '@ngxs/store';
import { MainState } from 'src/store/main.store';
export interface MiscWithStack extends MiscellanyItem {
  stack?: number;
}
@Component({
  selector: 'app-misc-inventory',
  templateUrl: './misc-inventory.component.html',
  styleUrl: './misc-inventory.component.scss',
})
export class MiscInventoryComponent {
  @Input() items: MiscWithStack[] = [];
  @Input() sockets = 0;
  @Input() selectedItem: MiscWithStack;
  @Output() selectNewItem = new EventEmitter<MiscWithStack>();
  public currentPhase = 0;
  @ViewChild('lootboxOpener') lootboxOpener: TemplateRef<any>;
  @ViewChild('itemRoulette') itemRoulette: ItemRouletteComponent;

  contextMenuService = inject(ContextMenuService);
  focuserService = inject(FocuserService);
  miscelanyService = inject(MiscellanyService);
  public roll: {
    spinWheelItems: Array<Item>;
    resultItem: Item;
  } = null;

  rarity = Rarity;
  public get filteredItems() {
    return fillInventoryBasedOnPlayerSockets(
      this.items
        .filter((item) =>
          item?.miscellanyItemData?.name
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        )
        .sort(),
      this.sockets
    );
  }

  public searchTerm = '';
  constructor() {}

  public open(miscLootbox: MiscWithStack) {
    this.focuserService.open(this.lootboxOpener, miscLootbox);
  }

  public async runRoulette(idLootbox: number) {
    this.currentPhase = 1;
    const result = await firstValueFrom(
      this.miscelanyService.openLootbox(idLootbox)
    );
    console.log(result);
    this.roll = result;
    setTimeout(() => {
      this.itemRoulette.startRoulette();
    }, 0);
  }
}
