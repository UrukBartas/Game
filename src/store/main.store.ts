import { Action, Selector, State, StateContext } from '@ngxs/store';

export class SetAddress {
  static readonly type = '[Address] Set';
  constructor(public payload: string) {}
}

export class DisconnectWallet {
  static readonly type = '[Wallet] Disconnect';
  constructor() {}
}

export class MainStateModel {
  public address: string;
}

@State<MainStateModel>({
  name: 'main',
  defaults: {
    address: '',
  },
})
export class MainState {
  @Selector()
  static accountSettings(state: MainStateModel): string {
    return state.address;
  }

  @Action(SetAddress)
  setAddress(
    { patchState }: StateContext<MainStateModel>,
    { payload }: SetAddress
  ) {
    patchState({
      address: payload,
    });
  }

  @Action(DisconnectWallet)
  disconnectWallet({ patchState }: StateContext<MainStateModel>) {
    patchState({
      address: undefined,
    });
  }

  @Selector()
  static getAddress(state: MainStateModel) {
    return state.address;
  }
}
