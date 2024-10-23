import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {
  getAccount,
  getNetwork,
  switchNetwork,
  waitForTransaction,
} from '@wagmi/core';

import { ethers } from 'ethers';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import * as party from 'party-js';
import { catchError, finalize, from } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  LootboxPresaleTypeEnum,
  PresaleContractService,
  SHIMMER_TESTNET_CHAINID,
} from 'src/services/contracts/presale-contract.service';
import { WalletService } from 'src/services/wallet.service';
import SwiperCore, { EffectCoverflow, Navigation, SwiperOptions } from 'swiper';
import { SwiperModule } from 'swiper/angular';
import { Rarity } from '../core/models/items.model';
import { getRarityColor } from '../utils';
import { lootboxItemDropsByRarity, lootboxes } from './data/lootbox.const';
import { PresaleClaimInfoModalComponent } from './modal/presale-claim-info-modal/presale-claim-info-modal.component';
import { LootboxPresaleThreeService } from './services/lootbox-presale-threejs.service';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

SwiperCore.use([Navigation, EffectCoverflow]);

@Component({
  selector: 'app-lootbox-presale',
  templateUrl: './lootbox-presale.component.html',
  styleUrls: ['./lootbox-presale.component.scss'],
  imports: [CommonModule, SwiperModule, NgxSliderModule],
  providers: [LootboxPresaleThreeService, PresaleContractService],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
})
export class LootboxPresaleComponent implements AfterViewInit {
  @ViewChild('threeContainer', { static: true })
  threeContainer!: ElementRef<HTMLDivElement>;
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    initialSlide: 1,
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
    },
  };
  itemsByRarity;
  openDetail = false;
  lootboxes = lootboxes.map((lootbox) => ({
    ...lootbox,
    image: environment.permaLinkImgPref + lootbox.image,
  }));
  activeLootbox = lootboxes[1];
  loading = false;
  rarityEnum = Rarity;
  private threeService = inject(LootboxPresaleThreeService);
  private presaleContractService = inject(PresaleContractService);
  private walletService = inject(WalletService);
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(BsModalService);
  toastService = inject(ToastrService);
  getRarityColor = getRarityColor;
  lootboxItemDropRateByRarity = lootboxItemDropsByRarity;
  sliderOptions = { floor: 0, ceil: 0 };
  sliderValue = 1;

  async ngAfterViewInit(): Promise<void> {
    this.threeService.initialize(
      this.threeContainer,
      this.getRarityFogColor(this.activeLootbox.rarity)
    );

    await this.getLootboxDataFromContract();
  }

  private async getLootboxDataFromContract() {
    this.walletService.isWeb3Connected$.subscribe(async (status) => {
      if (status) {
        lootboxes.forEach((lootbox) => {
          from(
            this.presaleContractService.getBoughtLootboxesOfType(
              LootboxPresaleTypeEnum[lootbox.rarity]
            )
          ).pipe(
            catchError(async (error) => {
              console.log(error);
              return [];
            })
          ).subscribe(async (response) => {
            const avaible =
              response.find((item) => item.poolType === 'PRESALE')?.amount ?? 0;

            lootbox.avaible = Number.parseInt(avaible.toString());
            lootbox.price = ethers.formatEther(response[0].toString());
            if (lootbox.rarity === Rarity.UNCOMMON) {
              this.sliderOptions.ceil = lootbox.avaible ?? 0;
            }
          });
        });
      }
    });
  }

  async mint(): Promise<void> {
    const account = getAccount();
    if (!account.isConnected) {
      this.walletService.address$.subscribe(async (address) => {
        if (address) {
          this.preMintCheck(address);
        }
      });

      this.walletService.modal.open();
    } else {
      this.preMintCheck(account.address);
    }
  }

  private async preMintCheck(address: string) {
    const checkNetwork = await this.checkNetworkIsCorrect();

    if (address && checkNetwork) {
      this.mintLootbox(address);
    }
  }

  private async checkNetworkIsCorrect(): Promise<boolean> {
    const network = getNetwork();
    if (network.chain?.id !== SHIMMER_TESTNET_CHAINID) {
      try {
        await switchNetwork({ chainId: SHIMMER_TESTNET_CHAINID });
        return true;
      } catch (error) {
        this.toastService.error('Failed to switch network');
        return false;
      }
    } else {
      return true;
    }
  }

  private setSliderCeil() {
    this.sliderOptions = { floor: 1, ceil: this.activeLootbox.avaible ?? 0 };
  }

  private async mintLootbox(address: string) {
    const totalPrice =
      Number.parseFloat(this.activeLootbox.price) * this.sliderValue;
    const priceInEther = ethers.parseEther(totalPrice.toString());

    try {
      const tx = await this.presaleContractService.mintMultipleLootboxes(
        this.sliderValue,
        address,
        LootboxPresaleTypeEnum[this.activeLootbox.rarity],
        priceInEther
      );
      this.loading = true;
      from(
        waitForTransaction({
          hash: tx.hash,
        })
      )
        .pipe(finalize(() => (this.loading = false)))
        .subscribe(async () => {
          this.activeLootbox.avaible =
            this.activeLootbox.avaible - this.sliderValue;
          this.setSliderCeil();
          party.confetti(this.threeContainer.nativeElement, {
            count: party.variation.range(100, 200),
          });
          this.toastService.success(
            'NFT minted, you will receive it in your wallet soon!'
          );
        });
    } catch (error) {
      this.toastService.error('Error during minting - Transaction canceled');
    }
  }

  openClaimInfo() {
    this.modalService.show(PresaleClaimInfoModalComponent);
  }

  onSlideChange(swiper: any) {
    this.activeLootbox = lootboxes[swiper.activeIndex];
    this.setSliderCeil();
    this.threeService.changeFogColor(
      this.getRarityFogColor(this.activeLootbox.rarity)
    );
    this.cdr.detectChanges();
  }

  getImageUrls(): string[] {
    const { rarity } = this.activeLootbox;
    return lootboxItemDropsByRarity[rarity].map((imageUrl) => {
      return environment.permaLinkImgPref + `/assets/${imageUrl}`;
    });
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

  getAvaibleColor(total: number, avaible: number): string {
    if (avaible / total > 0.5) return 'white';
    if (avaible / total > 0.3) return 'yellow';
    return 'orange';
  }
}
