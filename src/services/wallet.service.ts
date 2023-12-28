import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3 from 'web3'

export class WalletService {
  private web3: Web3
  private provider: any

  constructor() {}

  async connectWallet() {
    // Create a WalletConnect Provider
    this.provider = new WalletConnectProvider({
      infuraId: '2f6db9819c0a49969a53cc41ca96a8b2', // Replace with your Infura ID
    })

    // Subscribe to accounts change
    this.provider.on('accountsChanged', (accounts: string[]) => {
      console.log(accounts)
    })

    // Subscribe to chainId change
    this.provider.on('chainChanged', (chainId: number) => {
      console.log(chainId)
    })

    // Subscribe to session disconnection
    this.provider.on('disconnect', (code: number, reason: string) => {
      console.log(code, reason)
    })

    // Enable session (triggers QR Code modal)
    await this.provider.enable()

    // Initialize web3
    this.web3 = new Web3(this.provider)
  }

  async getAccount() {
    const accounts = await this.web3.eth.getAccounts()
    return accounts[0] // This is the user's address
  }
}
