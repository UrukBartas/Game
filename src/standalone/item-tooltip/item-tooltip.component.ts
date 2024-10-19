import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { camelCase } from 'lodash-es';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Item, ItemType, Rarity } from 'src/modules/core/models/items.model';
import { CompareItemPipe } from 'src/modules/core/pipes/compare-item.pipe';
import {
  getRarityBasedOnIRI,
  getRarityColor,
  getRarityText,
} from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';
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
  'item_rarity_stat',
  'canBeUpgraded',
];
export const mapPercentLabels = {
  per_health: 'total health',
  per_damage: 'total damage',
  per_armor: 'total armor',
  per_speed: 'total speed',
  per_energy: 'total energy',
  per_dodge: 'total dodge',
  per_crit: 'total crit',
  per_block: 'total block',
  per_accuracy: 'total accuracy',
  per_penetration: 'total penetration',
};
export const mapTotalPercentLabels = {
  totalPerHealth: 'per_health',
  totalPerDamage: 'per_damage',
  totalPerArmor: 'per_armor',
  totalPerSpeed: 'per_speed',
  totalPerEnergy: 'per_energy',
  totalPerDodge: 'per_dodge',
  totalPerCrit: 'per_crit',
  totalPerBlock: 'per_block',
  totalPerAccuracy: 'per_accuracy',
  totalPerPenetration: 'per_penetration',
};
const mapTypeOfWeapon = {
  Weapon1H: 'One handed',
  Weapon2H: 'Two handed',
};

export const getLoopableStatsKeys = (item: Item): Array<string[]> => {
  if (!item) return [];

  let keys = Object.keys(item).filter(
    (entry) =>
      !avoidableStats.find(
        (entryInner) => entryInner.toLowerCase() == entry.toLowerCase()
      ) &&
      !!item[entry] &&
      (item[entry] > 0 || !!entry.startsWith('per_'))
  );

  let nonPercentualStats = keys.filter((key) => !key.startsWith('per_')).sort();
  const percentualStats = keys.filter((key) => key.startsWith('per_')).sort();

  if (nonPercentualStats.includes('damage')) {
    nonPercentualStats = [
      'damage',
      ...nonPercentualStats.filter((key) => key !== 'damage'),
    ];
  }
  return [nonPercentualStats, percentualStats];
};

export const getPercentage = (key: string) => {
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
  public getRarityBasedOnIRI = getRarityBasedOnIRI;
  public viewportService = inject(ViewportService);
  public route = inject(ActivatedRoute);
  public rarityEnum = Rarity;
  public itemType = ItemType;
  public camelToe = camelCase;
  public abs = Math.abs;
  public ceil = Math.ceil;
  public nonPorcentualStatsLength = 0;
  private store = inject(Store);
  public prefix = environment.permaLinkImgPref;

  public player$ = this.store
    .select(MainState.getState)
    .pipe(map((entry) => entry.player));

  public isViewingPlayer =
    this.route?.snapshot?.url[0]?.path?.includes('view-player');

  public getLoopableStatsKeys(): Array<string> {
    const [nonPercentualStats, percentualStats] = getLoopableStatsKeys(
      this.item
    );
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
    return getPercentage(key);
  }
}
