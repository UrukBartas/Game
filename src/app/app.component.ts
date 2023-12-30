import { Component } from '@angular/core'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'
import { Web3Modal } from '@web3modal/wagmi/dist/types/src/client'
import { mainnet, arbitrum, bsc } from 'viem/chains'
import { watchAccount, disconnect, getAccount } from '@wagmi/core'
import { ScreenOrientation } from '@capacitor/screen-orientation'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  address: string | undefined
  modal: Web3Modal

  constructor() {
    this.lockOrientation()
    this.initWalletConnect()
  }

  async lockOrientation() {
    try {
      await ScreenOrientation.lock({ orientation: 'landscape' })
    } catch (error) {}
  }

  initWalletConnect() {
    const projectId = environment.walletConnectProjectId

    const metadata = {
      name: 'Uruk Bartas',
      description: 'Play to earn game',
      url: 'https://game.urukbartas.com/',
      icons: ['https://avatars.githubusercontent.com/u/89161645?s=400&u=45ee748438c04f06f854fc0d28942581967ef16f&v=4'],
    }

    const chains = [mainnet, arbitrum, bsc]
    const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

    watchAccount((account) => (this.address = account.address))

    this.modal = createWeb3Modal({ wagmiConfig, projectId, chains })
  }
}
