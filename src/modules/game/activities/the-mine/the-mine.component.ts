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
import { Rarity } from 'src/modules/core/models/items.model';
import { getRarityColor } from 'src/modules/utils';
import { ERC20ContractService } from 'src/services/contracts/erc20-contract.service';
import { NFTContractService } from 'src/services/contracts/nft-contract.service';
import { PlayerService } from 'src/services/player.service';
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
  uruksAllowed: number;
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

  // Rarity color mapping utility
  getRarityColor = getRarityColor;

  statsService = inject(StatsService);

  public tiers$ = this.statsService.getMineTiers().pipe(
    tap((tiers) => {
      console.debug('URUK BARTAS DEBUG: Fetched mine tiers', tiers);
      this.tiers = tiers;
    })
  );

  public tiers: Array<any> = [];
  public stakeType: 'in-game' | 'wallet' = 'wallet';

  // Constants
  public CONTRACT_IMAGE = 'assets/materials/15.webp';
  public prefix = environment.permaLinkImgPref;

  // Injected services
  store = inject(Store);
  walletService = inject(WalletService);
  spinnerService = inject(NgxSpinnerService);
  toastService = inject(ToastrService);
  modalService = inject(BsModalService);
  viewportService = inject(ViewportService);
  ERC20ContractService = inject(ERC20ContractService);
  NFTContractService = inject(NFTContractService);
  playerService = inject(PlayerService);
  totalMultichainWorkforce$ = this.playerService.getMultichainStakedAmount$();
  public RarityEnum = Rarity;
  // Reactive form controls
  useWallet = new FormControl(true);

  // Player state from the store
  player$ = this.store.select(MainState.getState).pipe(
    map((entry) => entry.player),
    tap((player) => {
      console.debug('URUK BARTAS DEBUG: Player state updated', player);
    })
  );

  // Selected Uruks to export
  public selectedUruksToExport = 0;

  // Reactive balance stream
  erc20Balance$ = new BehaviorSubject([]);

  erc20BalanceInterval$ = interval(2000).pipe(
    startWith(0),
    switchMap(() => {
      console.debug('URUK BARTAS DEBUG: Fetching valid wallet address');
      return this.walletService.getValidAddress$;
    }),
    switchMap(() => {
      console.debug('URUK BARTAS DEBUG: Fetching ERC20 balance for address');
      return from(
        this.ERC20ContractService.getBalanceOf(getAccount().address)
      ).pipe(
        catchError((err) => {
          console.error('URUK BARTAS DEBUG: Error fetching ERC20 balance', err);
          return err;
        }),
        map((entry) => {
          const formattedBalance = Number(
            ethers.formatEther(entry.toString())
          ).toFixed(8);
          console.debug(
            'URUK BARTAS DEBUG: Fetched ERC20 balance',
            formattedBalance
          );
          return formattedBalance;
        })
      );
    })
  );

  // Stake info reactive stream
  stakeInfo = new BehaviorSubject(null);

  stakeInfoInterval$ = interval(5000).pipe(
    startWith(0),
    switchMap(() => {
      console.debug(
        'URUK BARTAS DEBUG: Fetching valid wallet address for stake info'
      );
      return this.walletService.getValidAddress$;
    }),
    switchMap(() => {
      console.debug('URUK BARTAS DEBUG: Fetching stake info for address');
      return from(
        this.ERC20ContractService.getStakeInfo(getAccount().address)
      ).pipe(
        catchError((err) => {
          console.error('URUK BARTAS DEBUG: Error fetching stake info', err);
          return err;
        }),
        map((entry: any) => {
          console.debug('URUK BARTAS DEBUG: Raw stake info fetched', entry);
          const [amountStaked, timeStaked, requests] = entry;
          const formattedStakeInfo = {
            amountStaked: Number(ethers.formatEther(amountStaked.toString())),
            timeStaked: timeStaked.toString(),
            requests: (requests ?? []).map((request) => {
              const requestTime = Number(request.requestTime.toString()) * 1000;
              const additionalDays = 18 * 86400000; // 18 días en milisegundos
              return {
                amount: Number(ethers.formatEther(request.amount.toString())),
                remainingTime: new Date(requestTime + additionalDays),
              };
            }),
          };
          console.debug(
            'URUK BARTAS DEBUG: Formatted stake info',
            formattedStakeInfo
          );
          return formattedStakeInfo;
        })
      );
    })
  );

  constructor() {
    super();

    console.debug('URUK BARTAS DEBUG: Initializing TheMineComponent');

    this.erc20BalanceInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data: any) => {
        console.debug('URUK BARTAS DEBUG: Updated ERC20 balance', data);
        this.erc20Balance$.next(data);
      });

    this.stakeInfoInterval$.pipe(takeUntilDestroyed()).subscribe((data) => {
      console.debug('URUK BARTAS DEBUG: Updated stake info', data);
      this.stakeInfo.next(data);
    });

    this.useWallet.valueChanges.pipe(takeUntilDestroyed()).subscribe((data) => {
      console.debug('URUK BARTAS DEBUG: useWallet value changed', data);
      this.stakeType = data ? 'wallet' : 'in-game';
    });

    interval(5000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        console.debug('URUK BARTAS DEBUG: Dispatching RefreshPlayer action');
        this.store.dispatch(new RefreshPlayer());
      });

    this.startCountdown();
  }

  calculateEndTime(requestTime: number): Date {
    const eighteenDaysInMillis = 18 * 24 * 60 * 60 * 1000;
    const newTimestamp = requestTime + eighteenDaysInMillis;
    const endTime = new Date(newTimestamp);
    console.debug('URUK BARTAS DEBUG: Calculated end time', {
      requestTime,
      endTime,
    });
    return endTime;
  }

  public removeStaked() {
    console.debug('URUK BARTAS DEBUG: Triggering removeStaked');

    const config: ModalOptions = {
      initialState: {
        title: 'Remove staked position',
        maxAmount: this.stakeInfo.getValue()?.amountStaked ?? 0,
        description:
          'You are about to request an unstake of your funds, this will take 18 days to get completed. Do you want to continue?',
        accept: async (data: number) => {
          console.debug('URUK BARTAS DEBUG: Unstaking funds with amount', data);
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
    console.debug(
      'URUK BARTAS DEBUG: Attempting to give Uruks to workers',
      this.selectedUruksToExport
    );

    this.spinnerService.show();

    try {
      const tx = await this.ERC20ContractService.stakeTokens(
        [ethers.parseEther(this.selectedUruksToExport.toString())],
        []
      );
      console.debug('URUK BARTAS DEBUG: Transaction initiated', tx);

      const receipt = await waitForTransaction({
        hash: tx.hash,
      });
      console.debug('URUK BARTAS DEBUG: Transaction receipt', receipt);

      this.toastService.success(
        this.selectedUruksToExport + ' given to the goblin workers!'
      );

      this.selectedUruksToExport = 0;
      this.store.dispatch(new RefreshPlayer());
    } catch (error) {
      console.error(
        'URUK BARTAS DEBUG: Error during giveUruksToWorkers transaction',
        error
      );
      this.toastService.error(
        'Error during transaction - Transaction canceled'
      );
    }

    this.spinnerService.hide();
  }

  public async claimTokens(index: number) {
    console.debug('URUK BARTAS DEBUG: Claiming tokens for index', index);

    try {
      const result = await this.ERC20ContractService.triggerTx(() => {
        return this.ERC20ContractService.unstakeTokens([index], []);
      });
      console.debug('URUK BARTAS DEBUG: Tokens claimed', result);
    } catch (error) {
      console.error('URUK BARTAS DEBUG: Error during claimTokens', error);
    }
  }

  getActiveTier(amount: number) {
    const activeTier = this.tiers.find(
      (tier) =>
        (amount >= tier.start && amount < tier.end) ||
        (amount >= tier.start && !tier.end)
    );
    console.debug('URUK BARTAS DEBUG: Calculated active tier', {
      amount,
      activeTier,
    });
    return activeTier || null;
  }

  getCurrentTierImageSize() {
    const screenSize = this.viewportService.screenSize;
    const imageSize = ['xxl', 'xl', 'lg'].includes(screenSize) ? 200 : 100;

    console.debug('URUK BARTAS DEBUG: Calculated tier image size', {
      screenSize,
      imageSize,
    });

    return imageSize;
  }

  public isBigScreen() {
    const isBig = ['xxl', 'xl', 'lg'].includes(this.viewportService.screenSize);
    console.debug('URUK BARTAS DEBUG: Is big screen?', isBig);
    return isBig;
  }

  public getHighestTier() {
    const highestTier = this.tiers[this.tiers.length - 1];
    console.debug('URUK BARTAS DEBUG: Retrieved highest tier', highestTier);
    return highestTier;
  }

  startCountdown() {
    console.debug('URUK BARTAS DEBUG: Starting countdown');
    interval(1000).subscribe(() => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0);

      const timeDifference = Math.floor(
        (nextMidnight.getTime() - now.getTime()) / 1000
      );

      const hours = Math.floor(timeDifference / 3600);
      const minutes = Math.floor((timeDifference % 3600) / 60);
      const seconds = timeDifference % 60;

      this.formattedTime = `${this.pad(hours)}:${this.pad(
        minutes
      )}:${this.pad(seconds)}`;

      console.debug('URUK BARTAS DEBUG: Countdown updated', this.formattedTime);
    });
  }

  pad(value: number) {
    const paddedValue = value.toString().padStart(2, '0');
    console.debug('URUK BARTAS DEBUG: Padded value', { value, paddedValue });
    return paddedValue;
  }

  public displayHelpMine() {
    console.debug('URUK BARTAS DEBUG: Displaying mine help modal');
    this.modalService.show(TheMineInfoModalComponent);
  }
}
