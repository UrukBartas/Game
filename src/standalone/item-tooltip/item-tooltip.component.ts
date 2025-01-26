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
  getDurabilityPercentage,
  getDurabilityTier,
  getRarityBasedOnIRI,
  getRarityColor,
  getRarityText,
} from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';
import { ItemBoxComponent } from '../item-box/item-box.component';
import {
  Tier,
  TierizedProgressBarComponent,
} from '../tierized-progress-bar/tierized-progress-bar.component';
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
  'enchantmentCount',
  'enchantAddRarityCount',
  'enchantIncreaseLevelCount',
  'enchantRebornCount',
  'enchantShuffleCount',
  'durability',
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
  imports: [
    CommonModule,
    CompareItemPipe,
    NgbTooltipModule,
    TierizedProgressBarComponent,
    ItemBoxComponent,
  ],
  templateUrl: './item-tooltip.component.html',
  styleUrl: './item-tooltip.component.scss',
})
export class ItemTooltipComponent {
  public prefix = environment.permaLinkImgPref;
  @Input() item: Item;
  @Input() extraData: any = null;
  @Input() compareWith: Item;
  @Input() isBeingCompared = false;
  public getExtraData() {
    return this.item.extraData || this.extraData;
  }
  mapEnchantsImgs = {
    enchantAddRarityCount: {
      image: '/assets/misc/recipes/add_recipe.webp',
      description: (times) =>
        `This item was enchanted ${times} times with the Recipe of Enchantment`,
    },
    enchantIncreaseLevelCount: {
      image: '/assets/misc/recipes/upgrade_level_recipe.webp',
      description: (times) =>
        `This item was enchanted ${times} times with the Recipe of Ascension`,
    },
    enchantRebornCount: {
      image: '/assets/misc/recipes/total_rebirth.webp',
      description: (times) =>
        `This item was enchanted ${times} times with the Recipe of Total Reborn`,
    },
    enchantShuffleCount: {
      image: '/assets/misc/recipes/shuffle_recipe.webp',
      description: (times) =>
        `This item was enchanted ${times} times with the Recipe of Rarity Reborn`,
    },
  };
  public keys = Object.keys;
  public durabilityTiers: Tier[] = [
    {
      start: 0,
      end: 1,
      class: (activeTier: Tier) => this.getDurabilityColor(activeTier),
    },
    {
      start: 1,
      end: 2,
      class: (activeTier: Tier) => this.getDurabilityColor(activeTier),
    },
    {
      start: 2,
      end: 3,
      class: (activeTier: Tier) => this.getDurabilityColor(activeTier),
    },
    {
      start: 3,
      end: 4,
      class: (activeTier: Tier) => this.getDurabilityColor(activeTier),
    },
  ];
  public durabilityTierValue = getDurabilityTier;
  public getDurabilityPercentage = getDurabilityPercentage;
  public getRarityColor = getRarityColor;
  public getRarityText = getRarityText;
  public getRarityBasedOnIRI = getRarityBasedOnIRI;
  public formatNumberFn = this.formatNumber;
  public viewportService = inject(ViewportService);
  public route = inject(ActivatedRoute);
  public rarityEnum = Rarity;
  public itemType = ItemType;
  public camelToe = camelCase;
  public abs = Math.abs;
  public ceil = Math.ceil;
  public nonPorcentualStatsLength = 0;
  private store = inject(Store);

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
  //4 tiers
  private getDurabilityColor = (activeTierDurability: Tier): string => {
    if (activeTierDurability.end <= 1) return 'danger-durability';
    else if (activeTierDurability.end <= 2) {
      return 'warning-durability';
    } else if (activeTierDurability.end <= 3) {
      return 'good-durability';
    } else {
      return 'perfect-durability';
    }
  };

  formatNumber(value) {
    return this.abs(value % 1 === 0 ? value : parseFloat(value.toFixed(2)));
  }
}
