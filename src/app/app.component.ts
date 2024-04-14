import { Component, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar';
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';
import { ContextMenuService } from 'src/services/context-menu.service';
import { WalletService } from 'src/services/wallet.service';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';
import { getAnalytics } from "firebase/analytics";
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
    this.initializeFirebase();
  }
  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  async lockOrientation() {
    try {
      await ScreenOrientation.lock({ orientation: 'landscape' });
      await StatusBar.hide();
      await NavigationBar.hide();
    } catch (error) {}
  }

  public async initializeFirebase(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      return;
    }
    const app = initializeApp(environment.firebase);
    getAnalytics(app);
  }
}
