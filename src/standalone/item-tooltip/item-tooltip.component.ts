import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Item, ItemData, Rarity } from 'src/modules/core/models/items.model';
import { CompareItemPipe } from 'src/modules/core/pipes/compare-item.pipe';
import { getRarityColor, getRarityText } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-item-tooltip',
  standalone: true,
  imports: [CommonModule, CompareItemPipe],
  templateUrl: './item-tooltip.component.html',
  styleUrl: './item-tooltip.component.scss',
})
export class ItemTooltipComponent {
  @Input() item: Item;

  @Input() compareWith: Item;
  @Input() isBeingCompared = false;

  public getRarityColor = getRarityColor;
  public getRarityText = getRarityText;
  public viewportService = inject(ViewportService);
  public rarityEnum = Rarity;

  public getLoopableStatsKeys(): Array<string> {
    if (!this.item) return [];
    return Object.keys(this.item).filter(
      (entry) =>
        ![
          'id',
          'level',
          'upgradeLevel',
          'playerId',
          'player',
          'itemDataId',
          'itemData',
          'equipped',
          'enabled',
          'price',
          'selected',
          'shopItemId',
        ].includes(entry) &&
        !!this.item[entry] &&
        this.item[entry] > 0
    );
  }

  public parseKeyPascalCase(key: string) {
    return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
  }

  public getPercentage(key: string) {
    return ['dodge', 'accuracy', 'block', 'crit', 'penetration'].includes(key)
      ? '%'
      : '';
  }

}
