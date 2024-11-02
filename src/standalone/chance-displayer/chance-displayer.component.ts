import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { camelCase } from 'lodash';
import { Rarity } from 'src/modules/core/models/items.model';
import {
  MiscellanyItemType
} from 'src/modules/core/models/misc.model';
import { getRarityColor } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';
import { ItemBoxComponent } from '../item-box/item-box.component';

@Component({
  selector: 'app-chance-displayer',
  standalone: true,
  imports: [CommonModule, ItemBoxComponent],
  templateUrl: './chance-displayer.component.html',
  styleUrl: './chance-displayer.component.scss',
})
export class ChanceDisplayerComponent {
  @Input() rarity: Rarity;
  @Input() chance: number | string;
  @Input() image: string;
  @Input() type: string;
  @Input() height = -1;
  @Input() width = -1;
  @Input() stack = 1;

  public mapType = {
    [MiscellanyItemType.ComboLootbox]: 'Presale lootbox',
    [MiscellanyItemType.Boost]: 'Boost',
    [MiscellanyItemType.ItemSet]: 'Item full set',
    [MiscellanyItemType.MoneyBag]: 'Money bag',
    [MiscellanyItemType.Title_Suffix]: 'Title suffix',
    [MiscellanyItemType.Title_Prefix]: 'Title prefix',
  };

  viewportService = inject(ViewportService);
  public getRarityColor = getRarityColor;
  public camelCase = camelCase;
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
}
