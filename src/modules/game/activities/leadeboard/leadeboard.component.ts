import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { debounceTime, first, map, race, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { getRarityColor, rewardsByLeaderboardType, truncateEthereumAddress } from 'src/modules/utils';
import { PlayerService } from 'src/services/player.service';
import { PvPFightService } from 'src/services/pvp-fight.service';
import { ViewportService } from 'src/services/viewport.service';
import { WebSocketService } from 'src/services/websocket.service';
import { MainState } from 'src/store/main.store';
import { ChallengeModalComponent } from '../../components/challenge-modal/challenge-modal.component';
import { pvpTiers } from './const/pvp-tiers';
import { QuestTier, questTiers } from './const/quest-tiers';
import { LeaderboardType } from './enum/leaderboard-type.enum';
import { PlayerStateEnum } from './enum/player-state.enum';
@Component({
  selector: 'app-leadeboard',
  templateUrl: './leadeboard.component.html',
  styleUrl: './leadeboard.component.scss',
})
export class LeadeboardComponent extends TemplatePage {
  questTiers = questTiers;
  pvpTiers = pvpTiers;
  getRarityColor = getRarityColor;
  playerService = inject(PlayerService);
  fb = inject(FormBuilder);
  public sortBy = signal<string>('level');
  public sortType = signal<'asc' | 'desc'>('desc');
  public activePage = signal<number>(0);
  public chunkSize = signal<number>(25);
  public periodType = signal<'weekly' | 'monthly'>('weekly');
  public nameOrWallet = signal('');
  public lastPageSize = 0;
  public prefix = ViewportService.getPreffixImg();
  public viewportService = inject(ViewportService);
  public topThreePlayers = signal<any[]>([]);
  public Infinity = Infinity;
  public isHardcoreRealm = environment.realm === 'hardcore';

  public getLeaderboard$ = computed(() => {
    return this.playerService
      .getLeaderboard(
        this.sortBy(),
        this.sortType(),
        this.activePage(),
        this.chunkSize(),
        this.nameOrWallet(),
        this.periodType(),
        this.leaderboardType()
      )
      .pipe(
        map((players) => {
          if (this.activePage() === 0) {
            this.topThreePlayers.set(players.slice(0, 3));
          }
          return players.map((player, index) => {
            const title = this.getTitleForQuestsCompleted(
              player.finishedQuestsCount
            );
            return {
              ...player,
              pve: {
                ...title,
              },
              pvp: pvpTiers.find(
                (tier) =>
                  player.pvpIndex >= tier.range[0] &&
                  player.pvpIndex <= tier.range[1]
              ),
            };
          });
        }),
        tap((entry) => (this.lastPageSize = entry.length))
      );
  });

  public formGroup = this.fb.group({
    userOrWallet: ['', []],
  });
  public get userOrWallet() {
    return this.formGroup.get('userOrWallet') as FormControl;
  }
  public truncateAddress = truncateEthereumAddress;
  public websocket = inject(WebSocketService);
  public store = inject(Store);
  public modalService = inject(BsModalService);
  public pvpService = inject(PvPFightService);
  private router = inject(Router);
  public onlinePlayers: { address: string; state: PlayerStateEnum }[] = [];
  public getPlayerState = (playerId: string) => {
    const player = this.onlinePlayers.find(
      (onlinePlayer) => onlinePlayer.address === playerId
    );
    if (!player) return PlayerStateEnum.OFFLINE;
    return player.state;
  };
  public playerStates = PlayerStateEnum;
  public player$ = this.store.select(MainState.getPlayer);
  public leaderboardType = signal<LeaderboardType>(LeaderboardType.PVE);
  public leaderboardTypes = LeaderboardType;

  constructor() {
    super();
    this.formGroup
      .get('userOrWallet')
      .valueChanges.pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe((data) => this.nameOrWallet.set(data));
    this.websocket.onlinePlayers$
      .pipe(takeUntilDestroyed())
      .subscribe((players) => (this.onlinePlayers = players));
  }

  public setAllLeaderboard() {
    this.leaderboardType.set(LeaderboardType.ALL);
    this.sortBy.set('level');
    this.activePage.set(0);
  }

  public setPvpLeaderboard() {
    this.leaderboardType.set(LeaderboardType.PVP);
    this.sortBy.set('mmr');
  }

  public setTopPvpLeaderboard() {
    this.leaderboardType.set(LeaderboardType.TOP_PVP);
    this.sortBy.set('mmr');
    this.activePage.set(0);
  }

  public setLevelLeaderboard() {
    this.leaderboardType.set(LeaderboardType.PVE);
    this.sortBy.set('level');
  }

  public setHardcorePveLeaderboard() {
    this.leaderboardType.set(LeaderboardType.HARDCORE_PVE);
    this.sortBy.set('pveVictoriesWithoutDead');
    this.activePage.set(0);
  }

  public setHardcorePvpLeaderboard() {
    this.leaderboardType.set(LeaderboardType.HARDCORE_PVP);
    this.sortBy.set('pvpVictoriesWithoutDead');
    this.activePage.set(0);
  }

  public getTitleForQuestsCompleted(questsCompleted: number): QuestTier {
    for (let i = questTiers.length - 1; i >= 0; i--) {
      if (questsCompleted >= questTiers[i].maxQuests) {
        return questTiers[i];
      }
    }

    return questTiers[0];
  }

  public filterByMonth() {
    this.periodType.set('monthly');
  }

  public filterCurrentWeek() {
    this.periodType.set('weekly');
  }

  public nextPage() {
    this.activePage.set(this.activePage() + 1);
  }

  public prevPage() {
    this.activePage.set(this.activePage() - 1);
  }

  challengePlayer(opponent: PlayerModel) {
    const { id, name, level, image, mmr } = this.store.selectSnapshot(
      MainState.getPlayer
    );

    const config: ModalOptions = {
      initialState: {
        opponent: opponent,
        challenger: true,
        playerHasHigherMMR: mmr > opponent.mmr,
        opponentConnected:
          this.getPlayerState(opponent.id) === PlayerStateEnum.ONLINE,
        acceptAuto: () => this.acceptAutoPVP(modal, opponent.id),
        accept: () => this.acceptPVP(modal, opponent.id),
      },
    };
    const modal = this.modalService.show(ChallengeModalComponent, config);
    modal.onHidden.pipe(take(1)).subscribe(() => {
      this.websocket.cancelSentChallenge(
        { id, name, level, image },
        opponent.id
      );
    });
  }

  private acceptAutoPVP(modal, opponentAddress: string) {
    modal.content.awaiting = true;
    this.pvpService
      .createAutoFight(opponentAddress)
      .pipe(take(1))
      .subscribe(() => {
        modal.content.awaiting = false;
        modal.content.challengeResult = true;
        modal.content.challengeAccepted = true;

        setTimeout(() => {
          this.router.navigateByUrl('/arena/auto');
          modal.hide();
        }, 2000);
      });
  }

  private acceptPVP(modal, opponentId: string) {
    const { id, name, level, image } = this.store.selectSnapshot(
      MainState.getPlayer
    );
    modal.content.awaiting = true;
    race(this.websocket.acceptChallenge$, this.websocket.declineChallenge$)
      .pipe(first(), take(1))
      .subscribe((accept: boolean) => {
        modal.content.awaiting = false;
        modal.content.challengeResult = true;
        modal.content.challengeAccepted = accept;

        if (accept) {
          setTimeout(() => {
            this.router.navigateByUrl('/arena/pvp');
            modal.hide();
          }, 2000);
        }
      });
    this.websocket.sendChallenge({ id, name, level, image }, opponentId);
  }

  public challengePlayerAuto(opponent: PlayerModel) {
    const { id, name, level, image, mmr } = this.store.selectSnapshot(
      MainState.getPlayer
    );

    const config: ModalOptions = {
      initialState: {
        opponent: opponent,
        challenger: true,
        playerHasHigherMMR: mmr > opponent.mmr,
        opponentConnected: false,
        acceptAuto: () => this.acceptAutoPVP(modal, opponent.id),
        accept: null,
      },
    };
    const modal = this.modalService.show(ChallengeModalComponent, config);
    modal.onHidden.pipe(take(1)).subscribe(() => {
      this.websocket.cancelSentChallenge(
        { id, name, level, image },
        opponent.id
      );
    });
  }

  public getRewards() {
    return rewardsByLeaderboardType[this.leaderboardType()][this.periodType()];
  }

  public remoteIconHeight() {
    return this.viewportService.isMobile() ? 30 : 50;
  }

  public showPodium(): boolean {
    return true;
  }

  public getCountdownText(): string {
    const now = new Date();
    let targetDate: Date;

    if (this.periodType() === 'weekly') {
      targetDate = new Date(now);
      const daysUntilSunday = 7 - now.getDay();
      targetDate.setDate(now.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
      targetDate.setHours(23, 59, 59, 999);
    } else {
      targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffDays}d ${diffHours}h ${diffMinutes}m`;
  }

  public getProgressPercentage(completedQuests: number, currentTier: any): number {
    const nextTierQuests = this.getNextTierQuests(currentTier);
    const prevTierQuests = this.getPrevTierQuests(currentTier);

    if (nextTierQuests === Infinity) {
      return 100; // Ya está en el tier máximo
    }

    const tierProgress = completedQuests - prevTierQuests;
    const tierRange = nextTierQuests - prevTierQuests;
    return Math.min(100, Math.floor((tierProgress / tierRange) * 100));
  }

  public getNextTierQuests(currentTier: any): number {
    const currentIndex = this.questTiers.findIndex(tier => tier.title === currentTier.title);
    if (currentIndex === this.questTiers.length - 1) {
      return Infinity;
    }
    return this.questTiers[currentIndex + 1].maxQuests;
  }

  public getPrevTierQuests(currentTier: any): number {
    const currentIndex = this.questTiers.findIndex(tier => tier.title === currentTier.title);
    if (currentIndex === 0) {
      return 0;
    }
    return this.questTiers[currentIndex - 1].maxQuests;
  }

  public isPvpTierAchieved(player: any, tier: any): boolean {
    return player.pvpIndex >= tier.range[0] && player.pvpIndex <= tier.range[1];
  }

  /**
   * Agrupa items por su ID y cuenta la cantidad de cada uno
   * @param items Array de IDs de items
   * @returns Array de objetos con id y amount
   */
  public groupItemsByType(items: string[]): { id: string, amount: number }[] {
    if (!items || !items.length) return [];

    const groupedItems = {};

    // Contar ocurrencias de cada ID
    items.forEach(itemId => {
      if (!groupedItems[itemId]) {
        groupedItems[itemId] = 0;
      }
      groupedItems[itemId]++;
    });

    // Convertir a array de objetos { id, amount }
    return Object.keys(groupedItems).map(id => ({
      id,
      amount: groupedItems[id]
    }));
  }

}
