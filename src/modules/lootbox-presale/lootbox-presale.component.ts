import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { lootboxItemDropRateByRarity, lootboxes } from './data/lootbox.const';
import { LootboxPresaleThreeService } from './services/lootbox-presale-threejs.service';
import SwiperCore, { EffectCoverflow, Navigation, SwiperOptions } from 'swiper';
import { SwiperModule } from 'swiper/angular';
import { Rarity } from '../core/models/items.model';
import { getRarityColor } from '../utils';
import { CommonModule } from '@angular/common';

SwiperCore.use([Navigation, EffectCoverflow]);

@Component({
  selector: 'app-lootbox-presale',
  templateUrl: './lootbox-presale.component.html',
  styleUrls: ['./lootbox-presale.component.scss'],
  imports: [CommonModule, SwiperModule],
  providers: [LootboxPresaleThreeService],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
})
export class LootboxPresaleComponent implements AfterViewInit {
  @ViewChild('threeContainer', { static: true })
  threeContainer!: ElementRef<HTMLDivElement>;
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 10,
    navigation: true,
    effect: 'coverflow',
    coverflowEffect: {
      rotate: 100,
      stretch: 1,
      depth: 100,
      modifier: 1,
      slideShadows: false,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: false,
    },
  };
  itemsByRarity;
  openDetail = false;
  lootboxes = lootboxes;
  activeLootbox = lootboxes[0];
  rarityEnum = Rarity;
  private threeService = inject(LootboxPresaleThreeService);
  private cdr = inject(ChangeDetectorRef);
  getRarityColor = getRarityColor;
  lootboxItemDropRateByRarity = lootboxItemDropRateByRarity;

  ngAfterViewInit(): void {
    this.threeService.initialize(this.threeContainer);
  }

  onSlideChange(swiper: any) {
    this.activeLootbox = lootboxes[swiper.activeIndex];
    this.threeService.changeFogColor(
      this.getRarityFogColor(this.activeLootbox.rarity)
    );
    this.cdr.detectChanges();
  }

  getImageUrls(): string[] {
    const basePath = 'assets/presale/lootbox-items/';
    const rarity = this.activeLootbox.rarity;
    return Array.from(
      { length: 5 },
      (_, index) => `${basePath}${rarity.toLowerCase()}/${index + 1}.webp`
    );
  }

  private getRarityFogColor(rarity: Rarity): number {
    switch (rarity) {
      default:
      case Rarity.COMMON:
        return parseInt('ced4d2', 16);
      case Rarity.UNCOMMON:
        return parseInt('4889da', 16);
      case Rarity.EPIC:
        return parseInt('be53db', 16);
      case Rarity.LEGENDARY:
        return parseInt('ff8e2c', 16);
      case Rarity.MYTHIC:
        return parseInt('ff5d30', 16);
    }
  }
}
