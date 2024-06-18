import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { getAccount } from '@wagmi/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { debounceTime, first, map, race, take, tap } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { Rarity } from 'src/modules/core/models/items.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { getRarityColor, truncateEthereumAddress } from 'src/modules/utils';
import { PlayerService } from 'src/services/player.service';
import { WebSocketService } from 'src/services/websocket.service';
import { MainState } from 'src/store/main.store';
import { ChallengeModalComponent } from '../../components/challengee-modal/challenge-modal.component';
import { PlayerStateEnum } from './enum/player-state.enum';
import { questTiers } from './const/quest-tiers';
import { LeaderboardType } from './enum/leaderboard-type.enum';

@Component({
  selector: 'app-leadeboard',
  templateUrl: './leadeboard.component.html',
  styleUrl: './leadeboard.component.scss',
})
export class LeadeboardComponent extends TemplatePage {
  questTiers = questTiers;
  getRarityColor = getRarityColor;
  playerService = inject(PlayerService);
  fb = inject(FormBuilder);
  public sortBy = signal<string>('level');
  public sortType = signal<'asc' | 'desc'>('desc');
  public activePage = signal<number>(0);
  public chunkSize = signal<number>(25);
  public from = signal<Date>(new Date(0));
  public to = signal<Date>(new Date());
  public nameOrWallet = signal('');
  public lastPageSize = 0;
  public getLeaderboard$ = computed(() => {
    return this.playerService
      .getLeaderboard(
        this.sortBy(),
        this.sortType(),
        this.activePage(),
        this.chunkSize(),
        this.nameOrWallet(),
        this.from(),
        this.to()
      )
      .pipe(
        map((players) => {
          return players.map((player) => {
            const playerCasted = player as PlayerModel & { _count: any };
            const questsCompleted = playerCasted._count.quest;
            const title = this.getTitleForQuestsCompleted(questsCompleted);
            return {
              ...player,
              pve: {
                ...title,
              },
            };
          });
        }),
        tap((entry) => (this.lastPageSize = entry.length))
      );
  });

  public formGroup = this.fb.group({
    userOrWallet: ['', []],
  });
  public truncateAddress = truncateEthereumAddress;
  public websocket = inject(WebSocketService);
  public store = inject(Store);
  public modalService = inject(BsModalService);
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
  public actualAddress = this.store.selectSnapshot(MainState).address;
  public leaderboardType = LeaderboardType.PVE;
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

  public setPvpLeaderboard() {
    this.leaderboardType = LeaderboardType.PVP;
    this.sortBy.set('mmr');
  }
  public setLevelLeaderboard() {
    this.leaderboardType = LeaderboardType.PVE;
    this.sortBy.set('level');
  }

  public getTitleForQuestsCompleted(questsCompleted: number): {
    title: string;
    glow: string;
    rarity: Rarity;
  } {
    for (const tier of this.questTiers) {
      if (questsCompleted <= tier.maxQuests) {
        return tier;
      }
    }
    return { title: 'Unknown', glow: 'common', rarity: Rarity.COMMON };
  }

  public filterAllTime() {
    this.from.set(new Date(0));
    this.to.set(new Date());
  }

  public filterByMonth() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.from.set(startOfMonth);
    this.to.set(endOfMonth);
  }

  public filterCurrentWeek() {
    const now = new Date();

    const dayOfWeek = now.getDay();
    const dayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    this.from.set(startOfWeek);
    this.to.set(endOfWeek);
  }

  public getImgBasedOnRanking(number: number) {
    switch (number) {
      case 0:
        return `assets/leaderboard/${this.leaderboardType === LeaderboardType.PVE ? 'level' : 'pvp'}/gold.png`;
      case 1:
        return `assets/leaderboard/${this.leaderboardType === LeaderboardType.PVE ? 'level' : 'pvp'}/silver.png`;
      default:
        return `assets/leaderboard/${this.leaderboardType === LeaderboardType.PVE ? 'level' : 'pvp'}/bronze.png`;
    }
  }

  public nextPage() {
    this.activePage.set(this.activePage() + 1);
  }

  public prevPage() {
    this.activePage.set(this.activePage() - 1);
  }

  challengePlayer(player: PlayerModel) {
    const { id, name, level, image } = this.store.selectSnapshot(
      MainState.getState
    ).player;

    const config: ModalOptions = {
      initialState: {
        player,
        challenger: true,
        accept: () => {
          modal.content.awaiting = true;
          race(
            this.websocket.acceptChallenge$,
            this.websocket.declineChallenge$
          )
            .pipe(first(), take(1))
            .subscribe((accept: boolean) => {
              console.log('Result:', accept);
              modal.content.awaiting = false;
              modal.content.challengeResult = true;
              modal.content.challengeAccepted = accept;

              if (accept) {
                setTimeout(() => {
                  this.router.navigateByUrl('/arena');
                  modal.hide();
                }, 2000);
              }
            });
          this.websocket.sendChallenge({ id, name, level, image }, player.id);
        },
      },
    };
    const modal = this.modalService.show(ChallengeModalComponent, config);
  }
}
