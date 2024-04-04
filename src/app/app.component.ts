import { Component, inject } from '@angular/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { WalletService } from 'src/services/wallet.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public walletService = inject(WalletService);

  constructor() {
    this.walletService.initWalletConnect();
    this.lockOrientation();
  }
  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  async lockOrientation() {
    try {
      await ScreenOrientation.lock({ orientation: 'landscape' });
    } catch (error) {}
  }
}
