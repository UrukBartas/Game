import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { disconnect } from '@wagmi/core';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, take } from 'rxjs';
import { FightModel } from 'src/modules/core/models/fight.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { SessionModel } from 'src/modules/core/models/session.model';
import { AuthService } from 'src/services/auth.service';
import { PlayerService } from 'src/services/player.service';
import { SessionService } from 'src/services/session.service';
import { WalletService } from 'src/services/wallet.service';
import { WebSocketService } from 'src/services/websocket.service';

export class ConnectWallet {
  static readonly type = '[Wallet] Connect';
  constructor(public payload: string) {}
}

export class LoginPlayer {
  static readonly type = '[Player] Log in';
  constructor(public payload?: { email: string; password: string }) {}
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
const defaultState = {
  address: '',
  player: null,
  session: null,
  quests: null,
  fight: null,
};
@State<MainStateModel>({
  name: 'main',
  defaults: defaultState,
})
export class MainState {
  router = inject(Router);
  sessionService = inject(SessionService);
  playerService = inject(PlayerService);
  toastService = inject(ToastrService);
  store = inject(Store);
  walletService = inject(WalletService);
  websocket = inject(WebSocketService);
  authService = inject(AuthService);

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
  async loginPlayer({ patchState }: StateContext<MainStateModel>, { payload }) {
    let player = null;
    if (!!payload?.email) {
      player = await firstValueFrom(
        this.authService.loginPlayer(payload.email, payload.password)
      );
      if (!player)
        this.toastService.error("Credentials don't match, try again!");
    } else {
      player = await firstValueFrom(this.playerService.get('/'));
    }
    try {
      if (player) {
        const session = await firstValueFrom(this.sessionService.open());
        patchState({ player, session });
        this.router.navigateByUrl('/inventory');
      } else if (!this.router.url.includes('external')) {
        this.router.navigateByUrl('/create');
      }
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
        .subscribe(async () => {
          disconnect();
          await this.walletService.modal.close();
          this.toastService.info('Session clossed.');
          this.websocket.disconnect();
          const info = await Device.getInfo();
          if (info.platform == 'android') {
            App.exitApp();
          }
        });
    }
    if (!this.router.url.includes('external')) this.router.navigateByUrl('/');

    patchState(defaultState);
  }

  @Action(RefreshPlayer) async refreshPlayer({
    patchState,
  }: StateContext<MainStateModel>) {
    try {
      const player = await this.playerService
        .get('/')
        .pipe(take(1))
        .toPromise();
      patchState({
        player: player,
      });
    } catch (error) {
      this.store.dispatch(new DisconnectWallet());
    }
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
