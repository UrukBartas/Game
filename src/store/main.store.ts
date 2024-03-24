import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { disconnect } from '@wagmi/core';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { FightModel } from 'src/modules/core/models/fight.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { SessionModel } from 'src/modules/core/models/session.model';
import { PlayerService } from 'src/services/player.service';
import { SessionService } from 'src/services/session.service';

export class ConnectWallet {
  static readonly type = '[Wallet] Connect';
  constructor(public payload: string) {}
}

export class LoginPlayer {
  static readonly type = '[Player] Log in';
}

export class SetPlayer {
  static readonly type = '[Player] Set';
  constructor(public payload: PlayerModel) {}
}

export class RefreshPlayer {
  static readonly type = '[Player] Refresh';
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
    try {
      const session = await this.sessionService
        .open()
        .pipe(take(1))
        .toPromise();
      const player = await this.playerService
        .get('/')
        .pipe(take(1))
        .toPromise();
      patchState({ player, session });
      this.router.navigateByUrl('/inventory');
    } catch (error) {
      this.store.dispatch(new DisconnectWallet());
    }
  }

  @Action(DisconnectWallet)
  disconnectWallet({ patchState }: StateContext<MainStateModel>) {
    if (this.store.selectSnapshot(MainState.getState)?.session) {
      this.sessionService
        .close()
        .pipe(take(1))
        .subscribe(() => {
          disconnect();
          this.toastService.info('Session clossed.');
        });
    }

    this.router.navigateByUrl('/');

    patchState({
      address: null,
      player: null,
      session: null,
    });
  }

  @Action(RefreshPlayer) async refreshPlayer({
    patchState,
  }: StateContext<MainStateModel>) {
    try {
      const player = await this.playerService
        .get('/')
        .pipe(take(1))
        .toPromise();
      this.store.dispatch(new SetPlayer(player));
    } catch (error) {
      this.store.dispatch(new DisconnectWallet());
    }
  }

  @Action(SetPlayer)
  setPlayer(
    { patchState }: StateContext<MainStateModel>,
    data: { payload: PlayerModel }
  ) {
    patchState({
      player: data.payload,
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
