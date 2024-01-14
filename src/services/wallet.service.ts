import { Injectable, inject } from '@angular/core';
import { getAccount, signMessage, watchAccount } from '@wagmi/core';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { Web3Modal } from '@web3modal/wagmi/dist/types/src/client';
import { shimmer } from 'viem/chains';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { take } from 'rxjs';
import { Store } from '@ngxs/store';
import {
  DisconnectWallet,
  MainState,
  ConnectWallet,
  LoginUser,
  SetSession,
} from 'src/store/main.store';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { SessionService } from './session.service';
@Injectable({
  providedIn: 'root',
})
export class WalletService {
  modal: Web3Modal;

  public authService = inject(AuthService);
  public userService = inject(UserService);
  private toastService = inject(ToastrService);
  private router = inject(Router);
  public store = inject(Store);

  initWalletConnect() {
    const projectId = process.env['WALLET_CONNECT_PROJECT_ID'] ?? '';
    const metadata = {
      name: 'Uruk Bartas',
      description: 'Play to earn game',
      url: 'https://game.urukbartas.com/',
      icons: [
        'https://avatars.githubusercontent.com/u/89161645?s=400&u=45ee748438c04f06f854fc0d28942581967ef16f&v=4',
      ],
    };

    const chains = [shimmer];
    const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

    watchAccount(({ address }) => this.controlWalletFlow(address));

    this.modal = createWeb3Modal({ wagmiConfig, projectId, chains });
  }

  private controlWalletFlow(address: `0x${string}` | undefined) {
    const state = this.store.selectSnapshot(MainState.getState);

    if (state.address) {
      if (address === undefined || address !== state.address) {
        this.store.dispatch(new DisconnectWallet());
      }
    } else if (address && !state.address) {
      this.logIn();
    }
  }

  public logIn() {
    this.authService
      .getAuth()
      .pipe(take(1))
      .subscribe({
        next: async ({ nonce }) => {
          const message = `Sign this message to authenticate your Ethereum address: ${nonce}`;
          const sign = await signMessage({ message });
          const address: string = getAccount().address ?? '';

          this.authService
            .signAuth(sign, address, nonce)
            .pipe(take(1))
            .subscribe({
              next: (exists) => {
                this.store.dispatch(new ConnectWallet(address));
                if (exists) {
                  this.store.dispatch(new LoginUser());
                } else {
                  this.router.navigateByUrl('/create');
                }
              },
              error: () => {
                this.toastService.error('Couldnt verify the user');
              },
            });
        },
        error: () => {
          this.toastService.error("Couldn't reach the server");
        },
      });
  }
}
