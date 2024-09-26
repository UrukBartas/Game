import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import {
  getAccount,
  getNetwork,
  signMessage,
  watchAccount,
  watchNetwork,
} from '@wagmi/core';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { Web3Modal } from '@web3modal/wagmi/dist/types/src/client';
import { ToastrService } from 'ngx-toastr';
import { Event as Web3ModalEvent } from 'node_modules/@web3modal/core';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  filter,
  firstValueFrom,
  from,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {
  ConnectWallet,
  DisconnectWallet,
  LoginPlayer,
  MainState,
  RefreshPlayer,
} from 'src/store/main.store';
import { AuthService } from './auth.service';
import { PlayerService } from './player.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  public modal: Web3Modal;
  public authService = inject(AuthService);
  public sessionService = inject(SessionService);
  public playerService = inject(PlayerService);
  private toastService = inject(ToastrService);
  private router = inject(Router);
  public store = inject(Store);
  public latestModalEvent = signal<Web3ModalEvent>({
    type: 'track',
    event: 'MODAL_CREATED',
  });
  public address$ = new BehaviorSubject<`0x${string}` | undefined>(undefined);
  public getValidAddress$ = this.address$.pipe(filter((entry) => !!entry));
  public walletConnectIsLoggedIn$ = this.address$.pipe(map((entry) => !!entry));
  public chains: BehaviorSubject<Array<any> | null> = new BehaviorSubject(null);
  public isWeb3Connected$ = new BehaviorSubject(false);
  public activeNetworkId = new BehaviorSubject<number>(0);

  getChainById = (id: number) =>
    this.chains.getValue().find((chain) => chain.id == id);

  constructor() {
    this.initWallet();
    this.getValidAddress$.subscribe(() => {
      this.activeNetworkId.next(getNetwork()?.chain?.id);
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.activeNetworkId.next(getNetwork()?.chain?.id);
      }
    });

    this.getValidAddress$.subscribe(() => {
      watchNetwork((network) => {
        try {
          const isAllowed = this.chains
            .getValue()
            .find((chain) => chain.id == network.chain.id);
          if (!!isAllowed) {
            this.activeNetworkId.next(network.chain.id);
          } else {
            this.activeNetworkId.next(0);
          }
        } catch (error) {
          this.activeNetworkId.next(0);
        }
      });
    });
  }

  public allowChainConnected(specificChainId?: number) {
    const chainId = specificChainId ?? this.activeNetworkId.value;
    return this.chains.getValue().find((chain) => chain.id == chainId);
  }

  private initWallet() {
    this.sessionService.getChains().subscribe((chains) => {
      this.chains.next(chains);
      this.setupWallet();

      watchAccount(({ address }) => {
        this.address$.next(address);
      });

      this.getValidAddress$
        .pipe(debounceTime(300))
        .subscribe((address) => this.controlWalletFlow(address));
    });
  }

  private setupWallet() {
    const projectId = process.env['WALLET_CONNECT_PROJECT_ID'] ?? '';
    const metadata = {
      name: 'Uruk Bartas',
      description: 'Play to Earn Web3 RPG Game',
      url: 'https://game.urukbartas.com/',
      icons: [
        'https://avatars.githubusercontent.com/u/89161645?s=400&u=45ee748438c04f06f854fc0d28942581967ef16f&v=4',
      ],
    };
    const wagmiConfig = defaultWagmiConfig({
      projectId,
      chains: this.chains.getValue(),
      metadata,
    });

    this.modal = createWeb3Modal({
      wagmiConfig,
      projectId,
      chains: this.chains.getValue(),
    });

    this.modal.subscribeEvents((event) => {
      this.latestModalEvent.set(event.data);
    });

    this.isWeb3Connected$.next(true);
  }

  private async controlWalletFlow(address: `0x${string}` | undefined) {
    if (this.router.url == '/edit' || this.router.url == '/presale') return;
    const state = this.store.selectSnapshot(MainState.getState);

    if (state.address) {
      if (address === undefined || address !== state.address) {
        this.store.dispatch(new DisconnectWallet());
      } else {
        this.store.dispatch(new RefreshPlayer());
      }
    } else {
      if (!this.router.url.includes('external')) firstValueFrom(this.logIn());
    }
  }

  public loginVoid() {
    firstValueFrom(this.logIn());
  }

  public logIn() {
    return this.authService.getAuth().pipe(
      take(1),
      catchError((err) => {
        this.toastService.error("Couldn't reach the server");
        return of(err);
      }),
      switchMap(({ nonce }) => {
        const message = `Sign this message to authenticate your Ethereum address: ${nonce}`;
        return from(signMessage({ message })).pipe(
          map((sign) => [sign, nonce])
        );
      }),
      switchMap(([sign, nonce]) => {
        const address: string = getAccount().address ?? '';
        return this.authService.signAuth(sign, address, nonce).pipe(
          take(1),
          catchError((err) => {
            this.toastService.error('Couldnt verify the player');
            return of(err);
          }),
          tap((verificated) => {
            if (verificated) {
              this.store.dispatch(new ConnectWallet(address));
              this.store.dispatch(new LoginPlayer());
            } else {
              this.toastService.error('Couldnt verify the player');
            }
          })
        );
      })
    );
  }

  public verifyOwnership() {
    return this.authService.getAuth().pipe(
      take(1),
      catchError((err) => {
        this.toastService.error("Couldn't reach the server");
        return of(err);
      }),
      switchMap(({ nonce }) => {
        const message = `Sign this message to authenticate your Ethereum address: ${nonce}`;
        return from(signMessage({ message })).pipe(
          map((sign) => [sign, nonce])
        );
      }),
      switchMap(([sign, nonce]) => {
        const address: string = getAccount().address ?? '';
        return this.authService.checkSignature(sign, address, nonce);
      })
    );
  }
}
