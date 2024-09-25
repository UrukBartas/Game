import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { getAccount, waitForTransaction } from '@wagmi/core';
import { ethers } from 'ethers';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import {
  BehaviorSubject,
  catchError,
  from,
  interval,
  map,
  startWith,
  switchMap
} from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { Rarity } from 'src/modules/core/models/items.model';
import { getRarityColor } from 'src/modules/utils';
import { ERC20ContractService } from 'src/services/contracts/erc20-contract.service';
import { NFTContractService } from 'src/services/contracts/nft-contract.service';
import { ViewportService } from 'src/services/viewport.service';
import { WalletService } from 'src/services/wallet.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';
import { StakeRemoveRequestModalComponent } from './stake-remove-request-modal/stake-remove-request-modal.component';
export interface MineTier {
  start: number;
  end: number;
  matFactor: number;
  lootboxChance: number;
}
@Component({
  selector: 'app-the-mine',
  templateUrl: './the-mine.component.html',
  styleUrl: './the-mine.component.scss',
})
export class TheMineComponent extends TemplatePage {
  public today = new Date();
  public phase = 0;
  public subphase = 0;
  formattedTime: string = ''; // Formato de cuenta regresiva (MM:SS)
  getRarityColor = getRarityColor;
  public tiers = [
    {
      start: 1,
      end: 500,
      image: 'assets/mine/bare-hands.png',
      name: 'Bare hands',
      matFactor: 1,
      lootboxChance: 0.001,
      rarity: Rarity.COMMON,
    },
    {
      start: 500,
      end: 1000,
      name: 'Reinforcements',
      image: 'assets/mine/reinforcements.png',
      matFactor: 2,
      lootboxChance: 0.002,
      rarity: Rarity.UNCOMMON,
    },
    {
      start: 1000,
      end: 5000,
      name: 'Pickaxe',
      image: 'assets/mine/pico.png',
      matFactor: 3,
      lootboxChance: 0.01,
      rarity: Rarity.EPIC,
    },
    {
      start: 5000,
      end: 10000,
      name: 'Mine machine',
      image: 'assets/mine/mine-machine.png',
      matFactor: 5,
      lootboxChance: 0.02,
      rarity: Rarity.LEGENDARY,
    },
    {
      start: 10000,
      end: 100000,
      name: 'Dynamite',
      image: 'assets/mine/dinamite.png',
      matFactor: 10,
      lootboxChance: 0.05,
      rarity: Rarity.MYTHIC,
    },
  ] as Array<any>;
  public stakeType: 'in-game' | 'wallet' = 'wallet';
  public CONTRACT_IMAGE = 'assets/materials/15.webp';
  store = inject(Store);
  walletService = inject(WalletService);
  spinnerService = inject(NgxSpinnerService);
  toastService = inject(ToastrService);
  modalService = inject(BsModalService);
  viewportService = inject(ViewportService);
  ERC20ContractService = inject(ERC20ContractService);
  NFTContractService = inject(NFTContractService);
  useWallet = new FormControl(true);
  player$ = this.store
    .select(MainState.getState)
    .pipe(map((entry) => entry.player));
  public selectedUruksToExport = 0;
  erc20Balance$ = new BehaviorSubject([]);
  erc20BalanceInterval$ = interval(2000).pipe(
    startWith(0),
    switchMap(() => {
      return this.walletService.getValidAddress$;
    }),
    switchMap(() => {
      return from(
        this.ERC20ContractService.getBalanceOf(getAccount().address)
      ).pipe(
        catchError((err) => {
          console.error(err);
          return err;
        }),
        map((entry) => {
          return Number(ethers.formatEther(entry.toString())).toFixed(8);
        })
      );
    })
  );
  stakeInfo = new BehaviorSubject(null);
  stakeInfoInterval$ = interval(5000).pipe(
    startWith(0),
    switchMap(() => {
      return this.walletService.getValidAddress$;
    }),
    switchMap(() => {
      return from(
        this.ERC20ContractService.getStakeInfo(getAccount().address)
      ).pipe(
        catchError((err) => {
          console.error(err);
          return err;
        }),
        map((entry: any) => {
          const [amountStaked, timeStaked, requests] = entry;
          return {
            amountStaked: Number(ethers.formatEther(amountStaked.toString())),
            timeStaked: timeStaked.toString(),
            requests: [],
          };
        })
      );
    })
  );

  constructor() {
    super();
    this.erc20BalanceInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data: any) => {
        this.erc20Balance$.next(data);
      });
    this.stakeInfoInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data) => this.stakeInfo.next(data));
    this.useWallet.valueChanges.pipe(takeUntilDestroyed()).subscribe((data) => {
      if (data) {
        this.stakeType = 'wallet';
      } else {
        this.stakeType = 'in-game';
      }
    });
    interval(5000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.store.dispatch(new RefreshPlayer()));
    this.startCountdown();
  }

  calculateEndTime(requestTime: number): Date {
    const eighteenDaysInMillis = 18 * 24 * 60 * 60 * 1000;
    const newTimestamp = requestTime + eighteenDaysInMillis;
    return new Date(newTimestamp);
  }

  public removeStaked() {
    const config: ModalOptions = {
      initialState: {
        title: 'Remove staked position',
        maxAmount: this.stakeInfo.getValue().amountStaked,
        description:
          'You are about to request an unstake of your funds, this will take 18 days to get completed. Do you want to continue?',
        accept: async (data: number) => {
          await this.ERC20ContractService.triggerTx(() => {
            return this.ERC20ContractService.requestUnstake(
              [ethers.parseEther(data.toString())],
              []
            );
          });
          modalRef.hide();
        },
      },
    };
    const modalRef = this.modalService.show(
      StakeRemoveRequestModalComponent,
      config
    );
  }

  public async giveUruksToWorkers() {
    this.spinnerService.show();
    try {
      const tx = await this.ERC20ContractService.stakeTokens(
        [ethers.parseEther(this.selectedUruksToExport.toString())],
        []
      );
      const receipt = await waitForTransaction({
        hash: tx.hash,
      });
      this.toastService.success(
        this.selectedUruksToExport + ' given to the goblin workers!'
      );

      this.selectedUruksToExport = 0;
      this.store.dispatch(new RefreshPlayer());
    } catch (error) {
      this.toastService.error(
        'Error during transaction - Transaction canceled'
      );
    }
    this.spinnerService.hide();
  }

  public async claimTokens(index: number) {
    await this.ERC20ContractService.triggerTx(() => {
      return this.ERC20ContractService.unstakeTokens([index], []);
    });
  }

  getActiveTier(amount: number) {
    return (
      this.tiers.find((tier) => amount >= tier.start && amount < tier.end) ||
      null
    );
  }

  getCurrentTierImageSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 200;
      default:
        return 100;
    }
  }

  public isBigScreen() {
    return ['xxl', 'xl', 'lg'].includes(this.viewportService.screenSize);
  }

  public getHighestTier() {
    return this.tiers[this.tiers.length - 1];
  }

  startCountdown() {
    interval(1000).subscribe(() => {
      const now = new Date();
      const nextHour = new Date();
      nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Siguiente hora completa

      const timeDifference = Math.floor(
        (nextHour.getTime() - now.getTime()) / 1000
      ); // Diferencia en segundos
      const minutes = Math.floor(timeDifference / 60); // Obtener minutos
      const seconds = timeDifference % 60; // Obtener segundos

      this.formattedTime = `${this.pad(minutes)}:${this.pad(seconds)}`; // Formatear el tiempo
    });
  }

  pad(value: number) {
    return value.toString().padStart(2, '0'); // Asegurar que minutos y segundos tengan 2 dígitos
  }
}
