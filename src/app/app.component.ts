import { Component } from '@angular/core'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'
import { Web3Modal } from '@web3modal/wagmi/dist/types/src/client'
import { mainnet, arbitrum, bsc } from 'viem/chains'
import { watchAccount, disconnect, getAccount } from '@wagmi/core'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  walletConnectProjectId = '01b4ad31e05b34f9bfc0afd40086547c'
  infuraKey = '2f6db9819c0a49969a53cc41ca96a8b2'

  address: string | undefined
  modal: Web3Modal

  constructor() {
    const projectId = this.walletConnectProjectId

    const metadata = {
      name: 'My Website',
      description: 'My Website description',
      url: 'https://mywebsite.com',
      icons: ['https://avatars.githubusercontent.com/u/89161645?s=400&u=45ee748438c04f06f854fc0d28942581967ef16f&v=4'],
    }

    const chains = [mainnet, arbitrum, bsc]
    const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

    watchAccount((account) => (this.address = account.address))

    // 3. Create modal
    this.modal = createWeb3Modal({ wagmiConfig, projectId, chains })
  }

  connectWallet() {
    this.modal.open()
  }
}
