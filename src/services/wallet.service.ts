import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import {
  connect,
  Connector,
  disconnect,
  getAccount,
  InjectedConnector,
  signMessage,
  watchAccount,
} from '@wagmi/core';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { Web3Modal } from '@web3modal/wagmi/dist/types/src/client';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import {
  ConnectWallet,
  DisconnectWallet,
  LoginPlayer,
  MainState,
  RefreshPlayer,
} from 'src/store/main.store';
import { shimmerTestnet, shimmer } from 'viem/chains';
import { AuthService } from './auth.service';
import { PlayerService } from './player.service';
export const allowedChains = [
  {
    ...shimmerTestnet,
    img: 'assets/smr-testnet.png',
    NFT: '0xE2Dc34B0CDF64A958F14B7230ADFF090C5A2d13F' as `0x${string}`,
    ERC20: '0xD6c9f8B5C78a8439b384f0d265c41D68F15B0749' as `0x${string}`,
  },
  {
    ...shimmer,
    img: 'assets/smr.png',
    NFT: '0x4D8ccA0c1A3c6B455DE8c8D20Ea27241b38BBC33' as `0x${string}`,
    ERC20: '0x81f1B7248Bb987D7849B1F08FcE74666a7068ECe' as `0x${string}`,
  },
];

export const getChainById = (id: number) =>
  allowedChains.find((chain) => chain.id == id);

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  public modal: Web3Modal;
  connectWalletInterval;

  public authService = inject(AuthService);
  public playerService = inject(PlayerService);
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

    const wagmiConfig = defaultWagmiConfig({
      projectId,
      chains: allowedChains,
      enableWalletConnect: true,
      enableInjected: true,
      metadata,
    });
    watchAccount(({ address }) => this.controlWalletFlow(address));

    this.modal = createWeb3Modal({
      wagmiConfig,
      projectId,
      chains: allowedChains,
    });
  }

  private async controlWalletFlow(address: `0x${string}` | undefined) {
    const state = this.store.selectSnapshot(MainState.getState);

    if (state.address) {
      if (address === undefined || address !== state.address) {
        this.store.dispatch(new DisconnectWallet());
      } else {
        this.store.dispatch(new RefreshPlayer());
      }
    } else {
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
                  this.store.dispatch(new LoginPlayer());
                } else {
                  this.router.navigateByUrl('/create');
                }
              },
              error: () => {
                this.toastService.error('Couldnt verify the player');
              },
            });
        },
        error: () => {
          this.toastService.error("Couldn't reach the server");
        },
      });
  }
}
