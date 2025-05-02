import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { camelCase } from 'lodash-es';
import { map } from 'rxjs';
import { ItemSetPassive } from 'src/modules/core/models/item-set-passive.model';
import { ItemSetData } from 'src/modules/core/models/item-set.model';
import { DamageType, Item, ItemType, Rarity } from 'src/modules/core/models/items.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { CompareItemPipe } from 'src/modules/core/pipes/compare-item.pipe';
import {
  calculatedDurabilityRule,
  getDurabilityPercentage,
  getDurabilityTier,
  getPercentage,
  getRarityBasedOnIRI,
  getRarityColor,
  getRarityText,
  getStatIcon,
  getStatIconClass,
  getStatValueClass,
  getValueStatusClass,
  mapTotalPercentLabels,
  primaryStats
} from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';
import { LoadItemSetPassives, LoadItemSets, MainState } from 'src/store/main.store';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemTooltipComponent implements OnInit, OnChanges {
  public prefix = ViewportService.getPreffixImg();
  @Input() item: Item;
  @Input() extraData: any = null;
  @Input() compareWith: Item;
  @Input() isBeingCompared = false;
  getPercentage = getPercentage;
  // Propiedades para sets de items
  public itemSets: ItemSetData[] = [];
  public itemSetPassives: Record<string, ItemSetPassive> = {};
  public currentSet: ItemSetData | null = null;
  public equippedSetPieces: number = 0;
  public MainState = MainState;
  constructor(
    public store: Store,
    private cdr: ChangeDetectorRef
  ) { }

  private equippedSetPiecesCache = new Map<string, number>();
  private activeSetBonusesCache = new Map<string, any[]>();
  private pendingSetBonusesCache = new Map<string, any[]>();
  private itemSetCache: ItemSetData | null = null;
  private lastItemId: string | null = null;

  ngOnInit() {
    // Cargar los datos necesarios de una sola vez
    const state = this.store.snapshot();
    this.itemSets = state.main.itemSets || [];
    this.itemSetPassives = state.main.itemSetPassives || {};

    // Si los datos no están cargados, cargarlos
    if (this.itemSets.length === 0) {
      this.store.dispatch(new LoadItemSets()).subscribe(() => {
        this.itemSets = this.store.selectSnapshot(MainState.getItemSets);
        this.checkItemSet();
        this.cdr.markForCheck();
      });
    } else {
      this.checkItemSet();
    }

    if (Object.keys(this.itemSetPassives).length === 0) {
      this.store.dispatch(new LoadItemSetPassives()).subscribe(() => {
        this.itemSetPassives = this.store.selectSnapshot(MainState.getItemSetPassives);
        this.cdr.markForCheck();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['item']) {
      this.lastItemId = null;
      this.itemSetCache = null;
      this.equippedSetPiecesCache.clear();
      this.activeSetBonusesCache.clear();
      this.pendingSetBonusesCache.clear();
    }
  }

  // Verificar si el item pertenece a un set
  private checkItemSet() {
    if (this.item?.itemData?.set && this.itemSets?.length) {
      this.currentSet = this.itemSets.find(set => set.id === this.item.itemData.set) || null;

      // Pre-calcular las piezas equipadas para evitar múltiples cálculos
      const player = this.store.selectSnapshot(MainState.getPlayer);
      if (player) {
        this.equippedSetPieces = this.countEquippedSetPieces(player);
      }
    } else {
      this.currentSet = null;
      this.equippedSetPieces = 0;
    }
  }

  // Obtener los bonuses activos del set según las piezas equipadas
  public getActiveSetBonuses(): any[] {
    const currentSet = this.getItemSet();
    if (!currentSet) return [];

    const player = this.store.selectSnapshot(MainState.getPlayer);
    const equippedPieces = this.countEquippedSetPieces(player);

    // Crear una clave única para el caché
    const cacheKey = `${currentSet.id}-${equippedPieces}`;

    // Verificar si ya tenemos el resultado en caché
    if (this.activeSetBonusesCache.has(cacheKey)) {
      return this.activeSetBonusesCache.get(cacheKey);
    }

    // Calcular el resultado si no está en caché
    const result = currentSet.stages
      .filter(stage => equippedPieces >= stage.pieces)
      .map(stage => ({
        pieces: stage.pieces,
        bonusStats: stage.bonusStats,
        bonusPassive: stage.bonusPassive
      }));

    // Guardar en caché para futuras consultas
    this.activeSetBonusesCache.set(cacheKey, result);
    return result;
  }

  // Obtener los bonuses pendientes del set
  public getPendingSetBonuses(): any[] {
    const currentSet = this.getItemSet();
    if (!currentSet) return [];

    const player = this.store.selectSnapshot(MainState.getPlayer);
    const equippedPieces = this.countEquippedSetPieces(player);

    // Crear una clave única para el caché
    const cacheKey = `${currentSet.id}-${equippedPieces}`;

    // Verificar si ya tenemos el resultado en caché
    if (this.pendingSetBonusesCache.has(cacheKey)) {
      return this.pendingSetBonusesCache.get(cacheKey);
    }

    // Calcular el resultado si no está en caché
    const result = currentSet.stages
      .filter(stage => equippedPieces < stage.pieces)
      .map(stage => ({
        pieces: stage.pieces,
        bonusStats: stage.bonusStats,
        bonusPassive: stage.bonusPassive
      }));

    // Guardar en caché para futuras consultas
    this.pendingSetBonusesCache.set(cacheKey, result);
    return result;
  }

  // Formatear el nombre del stat para mostrar
  public formatStatName(statName: string): string {
    if (statName.startsWith('totalPer')) {
      const baseName = statName.replace('totalPer', '');
      return `+${baseName} %`;
    }
    return statName;
  }

  // Verificar si el item pertenece a un set
  public hasSetBonus(): boolean {
    return !!this.item?.itemData?.set;
  }

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
      primaryStats.includes(stat)
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
  public getStatIcon = getStatIcon;
  public getStatIconClass = getStatIconClass;
  public getStatValueClass = getStatValueClass;
  public getValueStatusClass = getValueStatusClass;
  public mapTotalPercentLabels = mapTotalPercentLabels;

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

  public Math = Math;

  /**
   * Determines if a comparison should be made between different weapon types
   * @returns The appropriate item to compare with
   */
  public getComparisonItem(): Item | null {
    if (!this.compareWith) return null;

    // If not weapons, just use the standard comparison
    if (
      !this.isWeapon(this.item?.itemData?.itemType) ||
      !this.isWeapon(this.compareWith?.itemData?.itemType)
    ) {
      return this.compareWith;
    }

    // For weapons, handle the 1H vs 2H comparison
    const currentIsOneHanded = this.item?.itemData?.itemType === ItemType.Weapon1H;
    const compareIsOneHanded = this.compareWith?.itemData?.itemType === ItemType.Weapon1H;

    // If same weapon type, standard comparison
    if (currentIsOneHanded === compareIsOneHanded) {
      return this.compareWith;
    }

    return this.compareWith;
  }

  /**
   * Checks if an item type is a weapon
   */
  private isWeapon(itemType: ItemType): boolean {
    return itemType === ItemType.Weapon1H || itemType === ItemType.Weapon2H;
  }

  public getDamageTypeColor(damageType: string): string {
    const damageColors = {
      [DamageType.BLUDGEONING]: '#d3d3d3', // Light gray for bludgeoning
      [DamageType.PIERCING]: '#c0c0c0',    // Silver for piercing
      [DamageType.SLASHING]: '#a9a9a9',    // Dark gray for slashing
      [DamageType.FIRE]: '#ff4500',        // Orange-red for fire
      [DamageType.COLD]: '#add8e6',        // Light blue for cold/ice
      [DamageType.ELECTRIC]: '#ffff00',    // Yellow for electric/lightning
      [DamageType.POISON]: '#32cd32',      // Lime green for poison
      [DamageType.PSYCHIC]: '#9370db',     // Medium purple for psychic/arcane
      [DamageType.HOLY]: '#ffd700',        // Gold for holy
      [DamageType.DARK]: '#800080',        // Purple for dark
    };

    return damageColors[damageType] || '#ffffff';
  }

  // Convertir objeto a array para iterar en el template
  public getObjectEntries(obj: any): { key: string, value: any }[] {
    if (!obj) return [];
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }

  // Añadir este método para obtener el número máximo de piezas del set
  public getMaxSetPieces(): number {
    const currentSet = this.getItemSet();
    if (!currentSet || !currentSet.stages || currentSet.stages.length === 0) {
      return 0;
    }

    // Encontrar el stage con el mayor número de piezas requeridas
    return Math.max(...currentSet.stages.map(stage => stage.pieces));
  }

  // Obtener la imagen de la pasiva del set
  public getPassiveImage(passiveId: string): string {
    return this.itemSetPassives[passiveId]?.image || '';
  }

  // Obtener el set al que pertenece el item
  public getItemSet(): ItemSetData | null {
    if (!this.item?.itemData?.set || !this.itemSets) return null;

    // Si el item no ha cambiado, devolver el resultado en caché
    if (this.lastItemId === this.item.id.toString() && this.itemSetCache) {
      return this.itemSetCache;
    }

    // Actualizar el caché
    this.lastItemId = this.item.id.toString();
    this.itemSetCache = this.itemSets.find(set => set.id === this.item.itemData.set) || null;

    return this.itemSetCache;
  }

  // Contar cuántas piezas del set están equipadas
  public countEquippedSetPieces(player: PlayerModel): number {
    const currentSet = this.getItemSet();
    if (!currentSet || !player?.items) return 0;

    // Crear una clave única para el caché
    const cacheKey = `${currentSet.id}-${player.id}`;

    // Verificar si ya tenemos el resultado en caché
    if (this.equippedSetPiecesCache.has(cacheKey)) {
      return this.equippedSetPiecesCache.get(cacheKey);
    }

    // Calcular el resultado si no está en caché
    let count = 0;
    for (const item of player.items) {
      if (item?.itemData?.set === currentSet.id) {
        count++;
      }
    }

    // Guardar en caché para futuras consultas
    this.equippedSetPiecesCache.set(cacheKey, count);
    return count;
  }
}
