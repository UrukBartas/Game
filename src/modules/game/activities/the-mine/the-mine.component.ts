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
  Observable,
  of,
} from 'rxjs';
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

export interface MineTier {
  start: number;
  end: number;
  matFactor: number;
  lootboxChance: number;
  uruksAllowed: number;
  uruksBoost?: number;
  apr?: number;
  name?: string;
  description?: string;
  image?: string;
  rarity?: Rarity;
  tier?: string;
}

export interface MineStakeInfo {
  id: string;
  stakeAmount: number;
  tier: string;
  unclaimedRewards: number;
  totalEarned: number;
  lastClaimAt: Date | null;
  isActive: boolean;
  canClaim: boolean;
  nextClaimAt: Date | null;
}

export interface RaidTarget {
  player: {
    name: string;
    image: string;
  };
  tier: MineTier;
  unclaimedRewards: number;
  isGuarded: boolean;
}

export interface RaidHistoryItem {
  attacker: {
    name: string;
    image: string;
  };
  defender: {
    name: string;
    image: string;
  };
  attackerWon: boolean;
  stolenAmount: number;
  wasGuarded: boolean;
  raidedAt: Date;
}

export interface UnstakeRequest {
  amount: number;
  isClaimable: boolean;
  timeRemaining: number;
}

export enum MineTierIdentifier {
  BARE_HANDS = 'BARE_HANDS',
  REINFORCEMENTS = 'REINFORCEMENTS',
  PICKEAXE = 'PICKEAXE',
  MINE_MACHINE = 'MINE_MACHINE',
  DYNAMITE = 'DYNAMITE',
  BLAST_FURNACE = 'BLAST_FURNACE',
  ADVANCED_MACHINERY = 'ADVANCED_MACHINERY',
  ENHANCED_EXPLOSIVES = 'ENHANCED_EXPLOSIVES',
  ASTRAL_EXTRACTOR = 'ASTRAL_EXTRACTOR',
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
  formattedTime: string = '';

  showTierProgress = false;
  Math = Math;

  mineStake: MineStakeInfo | null = null;
  isGuarding = false;
  guardCooldownRemaining = 0;
  claimCooldownRemaining = 0;
  raidCooldownRemaining = 0;
  selectedUruksToStake = 0;
  minStakeAmount = 1000;
  unstakeRequests: UnstakeRequest[] = [];
  raidTargets: RaidTarget[] = [];
  recentRaids: RaidHistoryItem[] = [];
  historyTab: 'attacks' | 'defenses' = 'attacks';

  getRarityColor = getRarityColor;

  statsService = inject(StatsService);

  public tiers$ = this.statsService.getMineTiers().pipe(
    map((tiers) => tiers.map(tier => ({
      ...tier,
      apr: tier.apr || 0
    }))),
    tap((tiers) => {
      this.tiers = tiers;
    })
  );

  public tiers: Array<any> = [];
  public stakeType: 'in-game' | 'wallet' = 'wallet';

  public CONTRACT_IMAGE = 'assets/materials/15.webp';
  public prefix = ViewportService.getPreffixImg();

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

  useWallet = new FormControl(true);

  player$ = this.store.select(MainState.getPlayer);

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
          return err;
        }),
        map((entry) => {
          const formattedBalance = Number(
            ethers.formatEther(entry.toString())
          ).toFixed(8);
          return formattedBalance;
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
          const formattedStakeInfo = {
            amountStaked: Number(ethers.formatEther(amountStaked.toString())),
            timeStaked: timeStaked.toString(),
            requests: (requests ?? []).map((request) => {
              const requestTime = Number(request.requestTime.toString()) * 1000;
              const additionalDays = 18 * 86400000;
              return {
                amount: Number(ethers.formatEther(request.amount.toString())),
                remainingTime: new Date(requestTime + additionalDays),
              };
            }),
          };
          return formattedStakeInfo;
        })
      );
    })
  );

  public readonly MAX_EXTRA_CRYPT_ATTEMPS = 6;

  constructor() {
    super();

    this.erc20BalanceInterval$
      .pipe(takeUntilDestroyed())
      .subscribe((data: any) => {
        this.erc20Balance$.next(data);
      });

    this.stakeInfoInterval$.pipe(takeUntilDestroyed()).subscribe((data) => {
      this.stakeInfo.next(data);
    });

    this.useWallet.valueChanges.pipe(takeUntilDestroyed()).subscribe((data) => {
      this.stakeType = data ? 'wallet' : 'in-game';
    });

    interval(5000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.store.dispatch(new RefreshPlayer());
      });

    this.startCountdown();
    this.loadMineStakeData();
  }

  calculateEndTime(requestTime: number): Date {
    const eighteenDaysInMillis = 18 * 24 * 60 * 60 * 1000;
    const newTimestamp = requestTime + eighteenDaysInMillis;
    const endTime = new Date(newTimestamp);
    return endTime;
  }

  public removeStaked() {
    const config: ModalOptions = {
      initialState: {
        title: 'Remove staked position',
        maxAmount: this.stakeInfo.getValue()?.amountStaked ?? 0,
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
    if (!this.tiers || this.tiers.length === 0) return null;
    const activeTier = this.tiers.find(
      (tier) =>
        (amount >= tier.start && amount < tier.end) ||
        (amount >= tier.start && !tier.end)
    );
    return activeTier || null;
  }

  getCurrentTierImageSize() {
    const screenSize = this.viewportService.screenSize;
    const imageSize = ['xxl', 'xl', 'lg'].includes(screenSize) ? 150 : 100;

    return imageSize;
  }

  public isBigScreen() {
    const isBig = ['xxl', 'xl', 'lg'].includes(this.viewportService.screenSize);
    return isBig;
  }

  public getHighestTier() {
    const highestTier = this.tiers[this.tiers.length - 1];
    return highestTier;
  }

  public getChainSwitcherHeight() {
    const isBig = ['xxl', 'xl', 'lg'].includes(this.viewportService.screenSize);
    return isBig ? 100 : 50;
  }

  startCountdown() {
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
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
      });
  }

  pad(value: number) {
    const paddedValue = value.toString().padStart(2, '0');
    return paddedValue;
  }

  public calculateExtraAttempts(tier: any): number {
    if (!tier) return 0;

    const tierIndex = this.tiers.findIndex((t) => t.id === tier.id);
    const pickaxeIndex = this.tiers.findIndex((t) => t.id === MineTierIdentifier.PICKEAXE);

    if (tierIndex === -1 || pickaxeIndex === -1) return 0;

    return Math.min(Math.max(tierIndex - pickaxeIndex, 0), this.MAX_EXTRA_CRYPT_ATTEMPS);
  }

  async loadMineStakeData() {
    // TODO: Implement API calls to load mine stake data
    // This should load mineStake, cooldowns, etc.
  }

  getCurrentTier(): MineTier | null {
    if (!this.mineStake) return null;
    return this.tiers.find(tier => tier.id === this.mineStake?.tier) || null;
  }

  getCurrentAPR(): number {
    const tier = this.getCurrentTier();
    return tier?.apr ? tier.apr * 100 : 0;
  }

  getPreviewTier(amount: number): MineTier | null {
    return this.tiers.find(tier => amount >= tier.start && amount < tier.end) || null;
  }


  async toggleGuard() {
    try {
      // TODO: Implement guard toggle API call
      this.isGuarding = !this.isGuarding;
      this.toastService.success(`Guard ${this.isGuarding ? 'activated' : 'deactivated'}`);
    } catch (error) {
      this.toastService.error('Failed to toggle guard');
    }
  }

  async claimRewards() {
    try {
      // TODO: Implement claim rewards API call
      this.toastService.success('Rewards claimed successfully!');
      await this.loadMineStakeData(); // Reload data
    } catch (error) {
      this.toastService.error('Failed to claim rewards');
    }
  }

  async stakeUruks() {
    try {
      // TODO: Implement stake uruks API call
      this.toastService.success('Uruks staked successfully!');
      this.phase = 0; // Return to main view
      await this.loadMineStakeData(); // Reload data
    } catch (error) {
      this.toastService.error('Failed to stake uruks');
    }
  }

  async initiateUnstake() {
    try {
      // TODO: Implement unstake initiation
      this.toastService.success('Unstake request initiated');
    } catch (error) {
      this.toastService.error('Failed to initiate unstake');
    }
  }

  async claimUnstake(index: number) {
    try {
      // TODO: Implement unstake claim
      this.toastService.success('Unstake claimed successfully!');
    } catch (error) {
      this.toastService.error('Failed to claim unstake');
    }
  }

  async openRaidModal() {
    try {
      // TODO: Load raid targets
      this.raidTargets = []; // Placeholder
      // Open modal logic here
    } catch (error) {
      this.toastService.error('Failed to load raid targets');
    }
  }

  selectRaidTarget(target: RaidTarget) {
    // TODO: Implement raid execution
    console.log('Raiding target:', target);
  }

  getRaidHistory(): Observable<RaidHistoryItem[]> {
    // TODO: Implement raid history loading
    return of(this.recentRaids);
  }

  getRaidMessage(raid: any): string {
    // TODO: Implement raid message formatting
    return 'Raid message placeholder';
  }

  // Utility methods to replace missing pipes
  formatTimeRemaining(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return 'Just now';
    }
  }
}
