import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { disconnect } from '@wagmi/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, firstValueFrom, take } from 'rxjs';
import { FightModel } from 'src/modules/core/models/fight.model';
import { MiscellanyItemData } from 'src/modules/core/models/misc.model';
import { NotificationModel } from 'src/modules/core/models/notifications.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { QuestModel } from 'src/modules/core/models/quest.model';
import { SessionModel } from 'src/modules/core/models/session.model';
import { StorePersistenceService } from 'src/modules/core/services/store-persistance.service';
import { AuthService } from 'src/services/auth.service';
import { NotificationsService } from 'src/services/notifications.service';
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

export class SetNotifications {
  static readonly type = '[Notifications] Set';
  constructor(public payload: NotificationModel[]) {}
}

export class DisconnectWallet {
  static readonly type = '[Wallet] Disconnect';
}

export class SetQuests {
  static readonly type = '[Quest] Set';
  constructor(public payload: QuestModel[]) {}
}

export class SetSkins {
  static readonly type = '[Skins] Set';
  constructor(public payload: MiscellanyItemData[]) {}
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
  public notifications: NotificationModel[] | null;
  public skins: MiscellanyItemData[] | null;
  public web3: boolean | null;
}
const defaultState = {
  address: '',
  player: null,
  session: null,
  quests: null,
  fight: null,
  notifications: null,
  skins: null,
  web3: false,
};

export const IS_DEFAULT_OR_EMPTY_STATE = (state: any) => {
  return (
    !state ||
    Object.keys(state).length == 0 ||
    JSON.stringify(state) == JSON.stringify(defaultState)
  );
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
  notificationsService = inject(NotificationsService);
  storePersistanceService = inject(StorePersistenceService);

  @Action(ConnectWallet)
  connectWallet(
    { patchState }: StateContext<MainStateModel>,
    { payload }: ConnectWallet
  ) {
    patchState({
      address: payload,
      web3: true,
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

  @Action(SetSkins)
  setSkins(
    { patchState }: StateContext<MainStateModel>,
    { payload }: SetSkins
  ) {
    patchState({
      skins: payload,
    });
  }

  @Action(SetNotifications)
  setNotifications(
    { patchState }: StateContext<MainStateModel>,
    { payload }: SetNotifications
  ) {
    patchState({
      notifications: payload,
    });
  }

  @Action(LoginPlayer)
  async loginPlayer({ patchState }: StateContext<MainStateModel>, { payload }) {
    let player = null;

    if (!!payload?.email) {
      try {
        await firstValueFrom(
          this.authService.loginPlayer(payload.email, payload.password)
        );
      } catch (error: any) {
        this.toastService.error(
          error?.message?.message ?? 'An error happened while doing your login'
        );
        return;
      }
    }

    player = await firstValueFrom(this.playerService.get('/'));

    try {
      if (player) {
        const session = await firstValueFrom(this.sessionService.open());
        const notifications = await firstValueFrom(
          this.notificationsService.getNotifications()
        );
        patchState({ player, session, notifications });
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

  @Selector()
  static getPlayer(state: MainStateModel): PlayerModel {
    return state.player;
  }

  @Selector()
  static getSkins(state: MainStateModel): MiscellanyItemData[] {
    return state.skins;
  }

  private loadedState = false;

  constructor() {
    this.store
      .select((x) => x)
      .pipe(debounceTime(300))
      .subscribe(async (state) => {
        const stateNotLoaded =
          !!state &&
          IS_DEFAULT_OR_EMPTY_STATE(state['main']) &&
          !this.loadedState;

        if (stateNotLoaded) {
          const stateLoaded = await this.storePersistanceService.loadState();

          if (stateLoaded) {
            this.store.reset(stateLoaded);
            this.loadedState = true;
          } else {
            await this.storePersistanceService.saveState(state);
          }
        } else {
          await this.storePersistanceService.saveState(state);
        }
      });
  }
}
