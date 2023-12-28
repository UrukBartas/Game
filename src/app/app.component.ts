import { Component } from '@angular/core'
import { WalletService } from 'src/services/wallet.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  address: string | null = null

  constructor(private walletService: WalletService) {}

  async connectWallet() {
    await this.walletService.connectWallet()
    this.address = await this.walletService.getAccount()
  }
}
