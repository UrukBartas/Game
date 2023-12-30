import { Component, inject } from '@angular/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { AccountService } from 'src/services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public account = inject(AccountService);
  constructor() {
    this.lockOrientation();
    this.account.initWalletConnect();
  }

  async lockOrientation() {
    try {
      await ScreenOrientation.lock({ orientation: 'landscape' });
    } catch (error) {}
  }
}
