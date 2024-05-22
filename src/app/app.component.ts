import { Component, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar';
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { SessionService } from 'src/services/session.service';
import { WalletService } from 'src/services/wallet.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public walletService = inject(WalletService);
  public tooltipService = inject(NgbTooltipConfig);
  public sessionService = inject(SessionService);
  //public pushNotificationsService = inject(PushNotificationsService);
  constructor() {
    this.sessionService.getChains().subscribe((data) => {
      this.walletService.chains.next(data);
      this.walletService.initWalletConnect();
    });
    this.lockOrientation();
    //this.initializeFirebase();
    //this.pushNotificationsService.init();
    this.tooltipService.container = 'body';
  }
  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  async lockOrientation() {
    try {
      await ScreenOrientation.lock({ orientation: 'landscape-primary' });
      await ScreenOrientation.unlock();
      await StatusBar.hide();
      await NavigationBar.hide();
    } catch (error) {}
  }

  public async initializeFirebase(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        return;
      }
      const app = initializeApp({
        apiKey: process.env['apiKey'],
        authDomain: process.env['authDomain'],
        projectId: process.env['projectId'],
        storageBucket: process.env['storageBucket'],
        messagingSenderId: process.env['messagingSenderId'],
        appId: process.env['appId'],
        measurementId: process.env['measurementId'],
        vapidKey: process.env['vapidKey'],
      } as any);
      getAnalytics(app);
    } catch (error) {
      console.error('An error happened while initializing Firebase', error);
    }
  }
}
