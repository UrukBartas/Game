import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { camelCase } from 'lodash';
import {
  Item,
  ItemData,
  ItemType,
  Rarity,
} from 'src/modules/core/models/items.model';
import { CompareItemPipe } from 'src/modules/core/pipes/compare-item.pipe';
import { getRarityColor, getRarityText } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';
export const avoidableStats = [
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
  'tokenId',
  'shopItemId',
  'quantity',
  'quantityToExport',
];
const mapPercentLabels = {
  per_health: 'health',
  per_damage: 'avg. damage',
  per_armor: 'armor',
  per_speed: 'speed',
  per_energy: 'energy',
  per_dodge: 'dodge',
  per_crit: 'crit',
  per_block: 'block',
  per_accuracy: 'accuracy',
  per_penetration: 'penetration',
};
const mapTypeOfWeapon = {
  Weapon1H: 'One handed',
  Weapon2H: 'Two handed',
};
@Component({
  selector: 'app-item-tooltip',
  standalone: true,
  imports: [CommonModule, CompareItemPipe, NgbTooltipModule],
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
  public itemType = ItemType;
  public camelToe = camelCase;
  public abs = Math.abs;
  public ceil = Math.ceil;
  public nonPorcentualStatsLength = 0;

  public getLoopableStatsKeys(): Array<string> {
    if (!this.item) return [];

    let keys = Object.keys(this.item).filter(
      (entry) =>
        !avoidableStats.find(
          (entryInner) => entryInner.toLowerCase() == entry.toLowerCase()
        ) &&
        !!this.item[entry] &&
        (this.item[entry] > 0 || !!entry.startsWith('per_'))
    );

    const nonPercentualStats = keys
      .filter((key) => !key.startsWith('per_'))
      .sort();
    const percentualStats = keys.filter((key) => key.startsWith('per_')).sort();
    this.nonPorcentualStatsLength = nonPercentualStats.length;
    return [...nonPercentualStats, ...percentualStats];
  }

  public parseKeyPascalCase(stat: string) {
    if (this.isRarityBonus(stat) && !!mapPercentLabels[stat])
      return mapPercentLabels[stat];
    return stat.charAt(0).toUpperCase() + stat.slice(1).toLowerCase();
  }

  public isRarityBonus = (stat) => Object.keys(mapPercentLabels).includes(stat);

  public mapItemType = (itemType: ItemType) => {
    if ([ItemType.Weapon1H, ItemType.Weapon2H].includes(itemType)) {
      return mapTypeOfWeapon[itemType];
    }
    return camelCase(itemType);
  };

  public getPercentage(key: string) {
    return [
      'dodge',
      'accuracy',
      'block',
      'crit',
      'penetration',
      ...Object.keys(mapPercentLabels),
    ].includes(key)
      ? '%'
      : '';
  }
}
