import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { SessionModel } from 'src/modules/core/models/session.model';
import { UserModel } from 'src/modules/core/models/user.model';
import { SessionService } from 'src/services/session.service';
import { UserService } from 'src/services/user.service';

export class ConnectWallet {
  static readonly type = '[Wallet] Connect';
  constructor(public payload: string) {}
}

export class LoginUser {
  static readonly type = '[User] Log in';
}

export class UpdateUser {
  static readonly type = '[User] Update';
  constructor(public payload: { name: string; email: string; image: string }) {}
}

export class SetSession {
  static readonly type = '[Session] Set';
  constructor(public payload: SessionModel) {}
}

export class DisconnectWallet {
  static readonly type = '[Wallet] Disconnect';
}

export class MainStateModel {
  public address: string | null;
  public user: UserModel | null;
  public session: SessionModel | null;
}

@State<MainStateModel>({
  name: 'main',
  defaults: {
    address: '',
    user: null,
    session: null,
  },
})
export class MainState {
  router = inject(Router);
  sessionService = inject(SessionService);
  userService = inject(UserService);
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

  @Action(LoginUser)
  loginUser({ patchState }: StateContext<MainStateModel>) {
    this.sessionService
      .open()
      .pipe(take(1))
      .subscribe((session) => {
        this.store.dispatch(new SetSession(session));
        this.userService
          .get('/')
          .pipe(take(1))
          .subscribe((user) => {
            this.router.navigateByUrl('/inventory');

            patchState({
              user,
            });
          });
      });
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
      user: null,
      session: null,
    });
  }

  @Action(UpdateUser)
  updateUser(
    { patchState }: StateContext<MainStateModel>,
    { payload }: UpdateUser
  ) {
    const user = this.store.selectSnapshot(MainState.getState)?.user;

    if (user) {
      user.name = payload.name;
      user.email = payload.email;
      user.image = payload.image;

      patchState({
        user,
      });
    }
  }

  @Selector()
  static getState(state: MainStateModel): MainStateModel {
    return state;
  }
}
