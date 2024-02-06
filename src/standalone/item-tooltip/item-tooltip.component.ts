import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Item } from 'src/modules/core/models/items.model';
import { getRarityColor, getRarityText } from 'src/modules/utils';

@Component({
  selector: 'app-item-tooltip',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './item-tooltip.component.html',
  styleUrl: './item-tooltip.component.scss',
})
export class ItemTooltipComponent {
  @Input() item: Item;

  public getRarityColor = getRarityColor;
  public getRarityText = getRarityText;

  public getLoopableStatsKeys(): Array<string> {
    if (!this.item) return [];
    return Object.keys(this.item).filter(
      (entry) =>
        ![
          'id',
          'level',
          'playerId',
          'player',
          'itemDataId',
          'itemData',
          'equipped',
          'enabled',
        ].includes(entry) &&
        !!this.item[entry] &&
        this.item[entry] > 0
    );
  }

  public parseKeyPascalCase(key: string) {
    return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
  }

  public getPercentage(key: string) {
    return ['dodge', 'accuracy', 'block', 'crit'].includes(key) ? '%' : '';
  }
}
