import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { camelCase } from 'lodash-es';
import { map } from 'rxjs';
import { Item, ItemType, Rarity } from 'src/modules/core/models/items.model';
import { CompareItemPipe } from 'src/modules/core/pipes/compare-item.pipe';
import {
  calculatedDurabilityRule,
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
  public prefix = ViewportService.getPreffixImg();
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
  public durabilityIndicator = calculatedDurabilityRule
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
      return {
        Weapon1H: this.viewportService.isMobile() ? '1H' : 'One-handed',
        Weapon2H: this.viewportService.isMobile() ? '2H' : 'Two-handed',
      }[itemType];
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

  // Categorize stats into primary, secondary, and percentage
  public getPrimaryStats(): string[] {
    const [nonPercentualStats, _] = getLoopableStatsKeys(this.item);
    // Primary stats are the most important ones like damage, health, armor
    return nonPercentualStats.filter(stat =>
      ['damage', 'health', 'armor', 'energy'].includes(stat)
    );
  }

  public getSecondaryStats(): string[] {
    const [nonPercentualStats, _] = getLoopableStatsKeys(this.item);
    const primaryStats = this.getPrimaryStats();
    // Secondary stats are all non-percentage stats that aren't primary
    return nonPercentualStats.filter(stat => !primaryStats.includes(stat));
  }

  public getPercentageStats(): string[] {
    const [_, percentualStats] = getLoopableStatsKeys(this.item);
    return percentualStats;
  }

  // Get appropriate icon for each stat type
  public getStatIcon(stat: string): string {
    const iconMap = {
      // Primary stats
      'damage': this.prefix + '/assets/icons/biceps.png',
      'health': this.prefix + '/assets/icons/health-normal.png',
      'armor': this.prefix + '/assets/icons/armor-vest.png',
      'energy': this.prefix + '/assets/icons/embrassed-energy.png',

      // Secondary stats
      'speed': this.prefix + '/assets/icons/sprint.png',
      'dodge': this.prefix + '/assets/icons/dodging.png',
      'crit': this.prefix + '/assets/icons/explosion-rays.png',
      'block': this.prefix + '/assets/icons/shield-bounces.png',
      'accuracy': this.prefix + '/assets/icons/bullseye.png',
      'penetration': this.prefix + '/assets/icons/cracked-shield.png',

      // Percentage stats
      'per_health': this.prefix + '/assets/icons/health-normal.png',
      'per_damage': this.prefix + '/assets/icons/biceps.png',
      'per_armor': this.prefix + '/assets/icons/armor-vest.png',
      'per_speed': this.prefix + '/assets/icons/sprint.png',
      'per_energy': this.prefix + '/assets/icons/embrassed-energy.png',
      'per_dodge': this.prefix + '/assets/icons/dodging.png',
      'per_crit': this.prefix + '/assets/icons/explosion-rays.png',
      'per_block': this.prefix + '/assets/icons/shield-bounces.png',
      'per_accuracy': this.prefix + '/assets/icons/bullseye.png',
      'per_penetration': this.prefix + '/assets/icons/cracked-shield.png'
    };

    return iconMap[stat] || this.prefix + '/assets/icons/biceps.png';
  }

  public getStatIconClass(stat: string): string {
    // Different background colors for different stat types
    if (['damage', 'health', 'armor', 'energy'].includes(stat)) {
      return 'primary-stat';
    } else if (stat.startsWith('per_')) {
      return 'percentage-stat';
    } else {
      return 'secondary-stat';
    }
  }

  public getDurabilityBarClass(durability: number, rarity: Rarity): string {
    const percentage = this.getDurabilityPercentage(durability, rarity);

    if (percentage > 66) {
      return 'durability-high';
    } else if (percentage > 33) {
      return 'durability-medium';
    } else {
      return 'durability-low';
    }
  }
}
