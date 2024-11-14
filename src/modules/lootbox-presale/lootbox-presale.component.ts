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
import { getAccount, waitForTransaction } from '@wagmi/core';

import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ethers } from 'ethers';
import { cloneDeep } from 'lodash';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import * as party from 'party-js';
import { finalize, firstValueFrom, forkJoin, from, map, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  LootboxPresaleTypeEnum,
  PresaleContractService,
} from 'src/services/contracts/presale-contract.service';
import { MiscellanyService } from 'src/services/miscellany.service';
import { WalletService } from 'src/services/wallet.service';
import { WebSocketService } from 'src/services/websocket.service';
import { ChainSwitcherComponent } from 'src/standalone/chain-switcher/chain-switcher.component';
import SwiperCore, { EffectCoverflow, Navigation, SwiperOptions } from 'swiper';
import { SwiperModule } from 'swiper/angular';
import { LootboxStatsDisplayerComponent } from '../../standalone/lootbox-stats-displayer/lootbox-stats-displayer.component';
import { Rarity } from '../core/models/items.model';
import {
  MiscellanyItemData,
  MiscellanyItemType,
} from '../core/models/misc.model';
import { getRarityColor } from '../utils';
import { PresaleClaimInfoModalComponent } from './modal/presale-claim-info-modal/presale-claim-info-modal.component';
import { LootboxPresaleThreeService } from './services/lootbox-presale-threejs.service';

SwiperCore.use([Navigation, EffectCoverflow]);
interface LootboxDataBlockchain {
  blockchain: any;
  data: MiscellanyItemData & { available: number; price: string };
}
@Component({
  selector: 'app-lootbox-presale',
  templateUrl: './lootbox-presale.component.html',
  styleUrls: ['./lootbox-presale.component.scss'],
  imports: [
    CommonModule,
    SwiperModule,
    NgxSliderModule,
    ChainSwitcherComponent,
    LootboxStatsDisplayerComponent,
    AccordionModule,
  ],
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
  activeLootbox: LootboxDataBlockchain = null;
  loading = false;
  rarityEnum = Rarity;
  private threeService = inject(LootboxPresaleThreeService);
  private presaleContractService = inject(PresaleContractService);
  private walletService = inject(WalletService);
  private miscService = inject(MiscellanyService);
  public modalService = inject(BsModalService);
  toastService = inject(ToastrService);
  cdr = inject(ChangeDetectorRef);
  getRarityColor = getRarityColor;
  sliderOptions = { floor: 0, ceil: 0 };
  sliderValue = 1;
  looboxes$ = this.miscService.getPresaleBoxes();
  lastLoadedLootboxes = [] as Array<LootboxDataBlockchain>;
  public prefix = environment.permaLinkImgPref;
  public MiscellanyItemType = MiscellanyItemType;

  public boxesMap = {
    [Rarity.COMMON]: {
      name: '⧫ Crate of Fortune ⧫',
      image: '/assets/presale/common-combobox.png',
    },
    [Rarity.UNCOMMON]: {
      name: '✦ Crate of Misteries ✦',
      image: '/assets/presale/uncommon-combobox.png',
    },
    [Rarity.EPIC]: {
      name: '★ Crate of Legends ★',
      image: '/assets/presale/epic-combobox.png',
    },
    [Rarity.LEGENDARY]: {
      name: '✶ Crate of Eternity ✶',
      image: '/assets/presale/legendary-combobox.png',
    },
    [Rarity.MYTHIC]: {
      name: '✹ Crate of Gods ✹',
      image: '/assets/presale/mythic-combobox.png',
    },
  };

  get totalPrice() {
    return Number.parseFloat(this.activeLootbox.data.price) * this.sliderValue;
  }

  constructor(private websocket: WebSocketService) {
    this.presaleContractService.autoConnectToValidChain();
  }

  ngOnInit(): void {
    this.threeService.initialize(
      this.threeContainer,
      this.getRarityFogColor(Rarity.UNCOMMON)
    );
    this.websocket.connect();
  }

  openFAQModal(faqTemplate: any): void {
    this.modalService.show(faqTemplate);
  }

  public showPolicy(template: any) {
    this.modalService.show(template, {
      class: 'policy-dialog',
    });
  }

  showFomoToast(message: string) {
    this.toastService.success(`🔥 ${message} 🔥`, 'Lootbox Purchased! ⏳', {
      timeOut: 4000,
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true,
      progressAnimation: 'increasing',
      tapToDismiss: false,
      newestOnTop: true,
    });
  }

  async ngAfterViewInit(): Promise<void> {
    setTimeout(async () => {
      await this.getLootboxDataFromContract();
    }, 500);
  }

  private async getLootboxDataFromContract() {
    this.walletService.walletConnectIsLoggedIn$.subscribe(async (status) => {
      if (status) {
        const address = await firstValueFrom(
          this.walletService.getValidAddress$
        );
        this.websocket.socket.on('nftPurchaseNotification', (data: any) => {
          if (data.buyer != address) this.showFomoToast(data.message);
        });
        const res = await firstValueFrom(
          this.looboxes$.pipe(
            map((lootboxes: Array<MiscellanyItemData>) => {
              const rarityOrder = ['COMMON', 'UNCOMMON', 'EPIC', 'LEGENDARY', 'MYTHIC'];
              return lootboxes.sort(
                (a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
              );
            }),
            switchMap((lootboxes: Array<MiscellanyItemData>) => {
              return forkJoin(
                lootboxes.map((lootbox) =>
                  from(
                    this.presaleContractService.getBoughtLootboxesOfType(
                      LootboxPresaleTypeEnum[lootbox.rarity]
                    )
                  ).pipe(
                    map((smartContractPresaleBox) => {
                      const available =
                        smartContractPresaleBox.find(
                          (item) => item.poolType === 'PRESALE'
                        )?.amount ?? 0;

                      const price = ethers.formatEther(
                        smartContractPresaleBox[0].toString()
                      );

                      const lootboxResult = {
                        data: {
                          ...lootbox,
                          available: Number.parseInt(available.toString(), 10),
                          price: price,
                        } as MiscellanyItemData,
                        blockchain: smartContractPresaleBox as any,
                      } as LootboxDataBlockchain;
                      if (lootbox.rarity === Rarity.UNCOMMON) {
                        this.activeLootbox = lootboxResult;
                        this.setSliderCeil();
                      }

                      return lootboxResult;
                    })
                  )
                )
              );
            })
          )
        );
        this.lastLoadedLootboxes = res as any;
      } else {
        this.walletService.modal.open();
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
    if (this.walletService.activeNetworkId.getValue() != 0 && address) {
      this.mintLootbox(address);
    } else {
      const ref = this.modalService.show(ChainSwitcherComponent, {
        initialState: {
          height: 200,
          width: 200,
        },
      });
      ref.content.networkChanged.subscribe(() => {
        ref.hide();
        setTimeout(() => {
          this.preMintCheck(address);
        }, 300);
      });
    }
  }

  private setSliderCeil() {
    this.sliderOptions = {
      floor: 1,
      ceil: this.activeLootbox.data.available ?? 0,
    };
  }

  private async mintLootbox(address: string) {
    const totalPrice = this.totalPrice;
    const priceInEther = ethers.parseEther(totalPrice.toString());
    try {
      const tx = await this.presaleContractService.mintMultipleLootboxes(
        this.sliderValue,
        address,
        LootboxPresaleTypeEnum[this.activeLootbox.data.rarity],
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
          this.activeLootbox.data.available =
            this.activeLootbox.data.available - this.sliderValue;
          this.setSliderCeil();
          party.confetti(this.threeContainer.nativeElement, {
            count: party.variation.range(100, 200),
          });
          this.toastService.success(
            'NFT minted, you will receive it in your wallet soon!'
          );
          this.openClaimInfo();
          this.websocket.socket.emit('nftPurchased', {
            buyer: address,
            lootbox: this.activeLootbox.data.rarity,
          });
        });
    } catch (error: any) {
      this.toastService.error(
        error.shortMessage ?? 'Error during minting - Transaction canceled'
      );
    }
  }

  openClaimInfo() {
    this.modalService.show(PresaleClaimInfoModalComponent);
  }

  onSlideChange(swiper: any) {
    if (this.lastLoadedLootboxes && this.lastLoadedLootboxes.length > 0) {
      this.activeLootbox = cloneDeep(
        this.lastLoadedLootboxes[swiper.activeIndex]
      );
      this.setSliderCeil();
      this.threeService.changeFogColor(
        this.getRarityFogColor(this.activeLootbox.data.rarity)
      );
      this.cdr.detectChanges();
    }
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

  getAvaibleColor(total: number, available: number): string {
    if (available / total > 0.5) return 'white';
    if (available / total > 0.3) return 'yellow';
    return 'orange';
  }
}
