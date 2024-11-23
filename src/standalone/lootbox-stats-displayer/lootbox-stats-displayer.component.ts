import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  signal,
} from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { NgPipesModule } from 'ngx-pipes';
import { firstValueFrom } from 'rxjs';
import { ItemType, Rarity } from 'src/modules/core/models/items.model';
import { MiscellanyItemType } from 'src/modules/core/models/misc.model';
import { MiscellanyService } from 'src/services/miscellany.service';
import { StatsService } from 'src/services/stats.service';
import { ChanceDisplayerComponent } from '../chance-displayer/chance-displayer.component';

@Component({
  selector: 'app-lootbox-stats-displayer',
  standalone: true,
  imports: [
    CommonModule,
    ChanceDisplayerComponent,
    ChanceDisplayerComponent,
    NgPipesModule,
  ],
  templateUrl: './lootbox-stats-displayer.component.html',
  styleUrl: './lootbox-stats-displayer.component.scss',
})
export class LootboxStatsDisplayerComponent {
  public _openingType = signal<MiscellanyItemType>(null);
  public _openingRarity = signal<Rarity>(null);
  cdr = inject(ChangeDetectorRef);

  public possibilitiesComboBox: any;
  public possibilitiesNormal: any;

  // @Input() properties with Signals
  @Input() public set openingType(data: MiscellanyItemType) {
    this._openingType.set(data); // Set the signal valueç
    this.updatePossibilities();
  }

  @Input() public set openingRarity(data: Rarity) {
    this._openingRarity.set(data); // Set the signal value
    this.updatePossibilities();
  }

  @Input() itemHeight: number = -1;
  @Input() itemWidth: number = -1;

  private async updatePossibilities() {
    const res = await firstValueFrom(
      this.stats.lootboxPossibilities(this._openingType())
    );
    if (this._openingType() == 'ComboLootbox') {
      this.possibilitiesComboBox = this.parsePossibilitiesComboBox(
        res,
        this._openingRarity()
      );
    } else {
      this.possibilitiesNormal = this.parsePossibilities(
        res,
        this._openingRarity()
      );
    }
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  public rarityEnum = Rarity;
  public pathPortrait = 'assets/premium-portraits/5.webp';
  public pathMaterial = 'assets/materials/38.webp';
  public pathMounts = 'assets/mounts/1.webp';
  public pathPrefix = 'assets/misc/titles/title_preffix.png';
  public pathSuffix = 'assets/misc/titles/title_suffix.png';
  public pathSilhouette = 'assets/misc/siluettes/knight.jpg';
  public mapTypeImage = {};

  constructor(private miscService: MiscellanyService) {
    const materials = this.miscService.poolMaterials;
    const randomIndex = Math.floor(Math.random() * materials.length);
    const randomMat = materials[randomIndex];
    this.pathMaterial = randomMat.imageLocal;

    const portraits = this.miscService.poolPortraits;
    const randomPortraitIndex = Math.floor(Math.random() * portraits.length);
    const randomPortrait = portraits[randomPortraitIndex];
    this.pathPortrait = randomPortrait.imageLocal;
    this.pathMounts = `assets/mounts/${Math.floor(Math.random() * 20) + 1}.webp`;

    this.mapTypeImage = {
      [MiscellanyItemType.Portrait]: this.pathPortrait,
      ['MATERIAL']: this.pathMaterial,
      ['MOUNT']: this.pathMounts,
      [MiscellanyItemType.Title_Prefix]: this.pathPrefix,
      [MiscellanyItemType.Title_Suffix]: this.pathSuffix,
      [MiscellanyItemType.MoneyBag]: 'assets/misc/bags/medium_bag_money.png',
      [MiscellanyItemType.Boost + '_EXP']: 'assets/misc/boosts/exp_boost.png',
      [MiscellanyItemType.Boost + '_URUKS']:
        'assets/misc/boosts/coin_boost.png',
      [MiscellanyItemType.Silhouette]: this.pathSilhouette,
    };
  }
  public lootboxMergedItems = [];
  stats = inject(StatsService);
  public parsePossibilitiesComboBox(possibilities: any, rarity: Rarity) {
    if (!possibilities) return null;
    const drops = possibilities[rarity].drop;
    const result = {
      Portraits: 0,
      Materials: 0,
      Mount: 0,
      Others: [] as any[],
      Title_Prefix: 0,
      Title_Suffix: 0,
      Bonus: possibilities[rarity]?.bonusDrop ?? [],
    };

    Object.keys(drops).forEach((key) => {
      const item = drops[key];
      if (item.type === 'Portrait') {
        result.Portraits += item.chance;
      } else if (item.type === 'MATERIAL') {
        result.Materials += item.chance;
      } else if (item.type === 'Mount') {
        result.Mount += item.chance;
      } else if (item.type == 'Title_Prefix') {
        result.Title_Prefix += item.chance;
      } else if (item.type == 'Title_Suffix') {
        result.Title_Suffix += item.chance;
      } else {
        result.Others.push({
          key: key,
          rarity: item.rarity,
          value: item.chance,
          type: item.type,
          image: this.getImageBasedOnType(
            item.type,
            item.rarity as Rarity,
            key
          ),
        });
      }
    });
    this.lootboxMergedItems = [
      {
        rarity: Rarity.EPIC,
        value: result.Portraits,
        image: this.pathPortrait,
        type: 'Portrait',
        height: this.itemHeight,
        width: this.itemWidth,
      },
      {
        rarity: Rarity.EPIC,
        value: result.Materials,
        image: this.pathMaterial,
        type: 'Material',
        height: this.itemHeight,
        width: this.itemWidth,
      },
      {
        rarity: Rarity.EPIC,
        value: result.Mount,
        image: this.pathMounts,
        type: 'Mount',
        height: this.itemHeight,
        width: this.itemWidth,
      },
      {
        rarity: Rarity.UNCOMMON,
        value: result.Title_Prefix,
        image: this.pathPrefix,
        type: 'Title Prefix',
        height: this.itemHeight,
        width: this.itemWidth,
      },
      {
        rarity: Rarity.UNCOMMON,
        value: result.Title_Suffix,
        image: this.pathSuffix,
        type: 'Title Suffix',
        height: this.itemHeight,
        width: this.itemWidth,
      },
      ...result.Others,
    ];
    return cloneDeep(result);
  }

  public parsePossibilities(itemPossibilities: any, rarity: Rarity) {
    if (!rarity || !itemPossibilities) return null;
    return Object.keys(itemPossibilities[rarity])
      .map((key) => {
        return {
          rarity: key as Rarity,
          value: itemPossibilities[rarity][key] as number,
          image: this.getImageBasedOnType('ITEM', key as Rarity),
        };
      })
      .filter((entry) => entry.value > 0);
  }

  public getImageBasedOnType(
    itemType: 'ITEM' | 'MoneyBag' | 'ItemSet',
    rarity: Rarity,
    key?: string
  ): string {
    let path = '';
    let possibleItems = Object.keys(ItemType).map((itemType) =>
      itemType.toLowerCase()
    );

    if (itemType == 'ITEM') {
      const randomIndex = Math.floor(Math.random() * possibleItems.length);
      let randomItem = possibleItems[randomIndex];
      if (randomItem.toLowerCase().includes('weapon')) {
        randomItem = 'weapon';
      }
      path = `assets/items/${randomItem}/${rarity.toLowerCase()}/1.webp`;
    } else if (itemType == 'MoneyBag') {
      const mapMoneyBags = {
        MoneyBag500: 'medium_bag_money.png',
        MoneyBag1000: 'big_bag_money.png',
        MoneyBag100: 'small_bag.png',
      };
      path = `assets/misc/bags/${mapMoneyBags[key]}`;
    } else if (itemType == 'ItemSet') {
      const mapItemSets = {
        CommonItemPackage: 'coommon_package_box.webp',
        UncommonItemPackage: 'uncommon_package_box.webp',
        EpicItemPackage: 'epic_package_box.webp',
        LegendaryItemPackage: 'legendary_package_box.webp',
        MythicItemPackage: 'mythic_package_box.webp',
      };
      path = `assets/misc/packages/${mapItemSets[key]}`;
    }

    return path;
  }
}
