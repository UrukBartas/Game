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
  switchMap,
  tap,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { getRarityColor } from 'src/modules/utils';
import { ERC20ContractService } from 'src/services/contracts/erc20-contract.service';
import { NFTContractService } from 'src/services/contracts/nft-contract.service';
import { StatsService } from 'src/services/stats.service';
import { ViewportService } from 'src/services/viewport.service';
import { WalletService } from 'src/services/wallet.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';
import { StakeRemoveRequestModalComponent } from './stake-remove-request-modal/stake-remove-request-modal.component';
import { TheMineInfoModalComponent } from './the-mine-help/the-mine-info-modal.component';
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
  statsService = inject(StatsService);
  public tiers$ = this.statsService
    .getMineTiers()
    .pipe(tap((e) => (this.tiers = e)));
  public tiers: Array<any> = [];
  public stakeType: 'in-game' | 'wallet' = 'wallet';
  public CONTRACT_IMAGE = 'assets/materials/15.webp';
  public prefix = environment.permaLinkImgPref;
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
          return err;
        }),
        map((entry: any) => {
          const [amountStaked, timeStaked, requests] = entry;
          return {
            amountStaked: Number(ethers.formatEther(amountStaked.toString())),
            timeStaked: timeStaked.toString(),
            requests: (requests ?? []).map((entry) => {
              const requestTime = Number(entry.requestTime.toString()) * 1000;
              const additionalDays = 18 * 86400000; // 18 días en milisegundos TODO CONECTARLO AL SC
              return {
                amount: Number(ethers.formatEther(entry.amount.toString())),
                remainingTime: new Date(requestTime + additionalDays), // Sumar 18 días
              };
            }),
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
      const nextMidnight = new Date();
      // Ajustar la fecha al próximo día a medianoche
      nextMidnight.setHours(24, 0, 0, 0);

      // Diferencia en segundos hasta la medianoche
      const timeDifference = Math.floor(
        (nextMidnight.getTime() - now.getTime()) / 1000
      );

      // Obtener horas, minutos y segundos
      const hours = Math.floor(timeDifference / 3600); // Obtener horas
      const minutes = Math.floor((timeDifference % 3600) / 60); // Obtener minutos
      const seconds = timeDifference % 60; // Obtener segundos

      // Actualizar el formato del tiempo
      this.formattedTime = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`; // Formatear el tiempo como HH:MM:SS
    });
  }

  // Método para asegurarse de que los números tengan siempre 2 dígitos
  pad(value: number) {
    return value.toString().padStart(2, '0'); // Asegurar que horas, minutos y segundos tengan 2 dígitos
  }

  public displayHelpMine() {
    this.modalService.show(TheMineInfoModalComponent);
  }
}
