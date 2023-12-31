import { Injectable } from '@angular/core';
import { watchAccount } from '@wagmi/core';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { Web3Modal } from '@web3modal/wagmi/dist/types/src/client';
import { arbitrum, bsc, mainnet } from 'viem/chains';
@Injectable({
  providedIn: 'root',
})
export class AccountService {
  address: string | undefined;
  modal: Web3Modal;

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

    const chains = [mainnet, arbitrum, bsc];
    const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

    watchAccount((account) => (this.address = account.address));

    this.modal = createWeb3Modal({ wagmiConfig, projectId, chains });
  }
}
