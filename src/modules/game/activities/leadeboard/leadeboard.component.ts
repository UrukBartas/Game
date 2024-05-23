import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { getAccount } from '@wagmi/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { debounceTime, first, race, take, tap } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { truncateEthereumAddress } from 'src/modules/utils';
import { PlayerService } from 'src/services/player.service';
import { WebSocketService } from 'src/services/websocket.service';
import { MainState } from 'src/store/main.store';
import { ChallengeModalComponent } from '../../components/challengee-modal/challenge-modal.component';

@Component({
  selector: 'app-leadeboard',
  templateUrl: './leadeboard.component.html',
  styleUrl: './leadeboard.component.scss',
})
export class LeadeboardComponent extends TemplatePage {
  playerService = inject(PlayerService);
  fb = inject(FormBuilder);
  public sortBy = signal<string>('level');
  public sortType = signal<'asc' | 'desc'>('desc');
  public activePage = signal<number>(0);
  public chunkSize = signal<number>(25);
  public nameOrWallet = signal('');
  public lastPageSize = 0;
  public getLeaderboard$ = computed(() => {
    return this.playerService
      .getLeaderboard(
        this.sortBy(),
        this.sortType(),
        this.activePage(),
        this.chunkSize(),
        this.nameOrWallet()
      )
      .pipe(tap((entry) => (this.lastPageSize = entry.length)));
  });
  public formGroup = this.fb.group({
    userOrWallet: ['', []],
  });

  public truncateAddress = truncateEthereumAddress;
  public actualAddress = getAccount().address;
  public websocket = inject(WebSocketService);
  public store = inject(Store);
  public modalService = inject(BsModalService);
  private router = inject(Router);
  public onlinePlayers: string[] = [];
  public isPlayerConnected = (playerId: string) =>
    this.onlinePlayers.some((onlinePlayer) => onlinePlayer === playerId);

  public getImgBasedOnRanking(number: number) {
    switch (number) {
      case 0:
        return 'assets/leaderboard/gold.png';
      case 1:
        return 'assets/leaderboard/silver.png';
      default:
        return 'assets/leaderboard/third.png';
    }
  }

  public nextPage() {
    this.activePage.set(this.activePage() + 1);
  }

  public prevPage() {
    this.activePage.set(this.activePage() - 1);
  }

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
