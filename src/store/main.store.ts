import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, take } from 'rxjs';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { SessionModel } from 'src/modules/core/models/session.model';
import { SessionService } from 'src/services/session.service';
import { PlayerService } from 'src/services/player.service';
import { FightModel } from 'src/modules/core/models/fight.model';

export class ConnectWallet {
  static readonly type = '[Wallet] Connect';
  constructor(public payload: string) {}
}

export class LoginPlayer {
  static readonly type = '[Player] Log in';
}

export class UpdatePlayer {
  static readonly type = '[Player] Update';
  constructor(public payload: PlayerModel) {}
}

export class SetSession {
  static readonly type = '[Session] Set';
  constructor(public payload: SessionModel) {}
}

export class DisconnectWallet {
  static readonly type = '[Wallet] Disconnect';
}

export class SetQuests {
  static readonly type = '[Quest] Set';
  constructor(public payload: QuestModel[]) {}
}

export class StartFight {
  static readonly type = '[Fight] Start';
  constructor(public payload: FightModel) {}
}

export class EndFight {
  static readonly type = '[Fight] End';
  constructor() {}
}

export class MainStateModel {
  public address: string | null;
  public player: PlayerModel | null;
  public session: SessionModel | null;
  public quests: QuestModel[] | null;
  public fight: FightModel | null;
}

@State<MainStateModel>({
  name: 'main',
  defaults: {
    address: '',
    player: null,
    session: null,
    quests: null,
    fight: null,
  },
})
export class MainState {
  router = inject(Router);
  sessionService = inject(SessionService);
  playerService = inject(PlayerService);
  toastService = inject(ToastrService);
  store = inject(Store);

  @Action(ConnectWallet)
  connectWallet(
    { patchState }: StateContext<MainStateModel>,
    { payload }: ConnectWallet
  ) {
    patchState({
      address: payload,
    });
  }

  @Action(SetSession)
  setSession(
    { patchState }: StateContext<MainStateModel>,
    { payload }: SetSession
  ) {
    patchState({
      session: payload,
    });
  }

  @Action(SetQuests)
  startQuest(
    { patchState }: StateContext<MainStateModel>,
    { payload }: SetQuests
  ) {
    patchState({
      quests: payload,
    });
  }

  @Action(LoginPlayer)
  async loginPlayer({ patchState }: StateContext<MainStateModel>) {
    // No cambiar a observables da problemas de syncro
    const session = await this.sessionService.open().pipe(take(1)).toPromise();
    const player = await this.playerService.get('/').pipe(take(1)).toPromise();

    patchState({ player, session });
    this.router.navigateByUrl('/inventory');
  }

  @Action(DisconnectWallet)
  disconnectWallet({ patchState }: StateContext<MainStateModel>) {
    if (this.store.selectSnapshot(MainState.getState)?.session) {
      this.sessionService
        .close()
        .pipe(take(1))
        .subscribe(() => this.toastService.info('Session clossed.'));
    }

    this.router.navigateByUrl('/');

    patchState({
      address: null,
      player: null,
      session: null,
    });
  }

  @Action(UpdatePlayer)
  updatePlayer(
    { patchState }: StateContext<MainStateModel>,
    { payload }: UpdatePlayer
  ) {
    patchState({
      player: payload,
    });
  }

  @Action(StartFight)
  startFight(
    { patchState }: StateContext<MainStateModel>,
    { payload }: StartFight
  ) {
    patchState({
      fight: payload,
    });
  }

  @Action(EndFight)
  endFight({ patchState }: StateContext<MainStateModel>) {
    patchState({
      fight: null,
    });
  }

  @Selector()
  static getState(state: MainStateModel): MainStateModel {
    return state;
  }
}
