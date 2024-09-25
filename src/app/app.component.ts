import { Component, inject } from '@angular/core';
import { StatusBar } from '@capacitor/status-bar';
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/services/auth.service';
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
  public authService = inject(AuthService);
  constructor() {
    this.lockOrientation();
    this.tooltipService.container = 'body';
    this.tooltipService.openDelay = 200;
  }
  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  async lockOrientation() {
    try {
      await StatusBar.hide();
      await NavigationBar.hide();
      document.addEventListener('resume', async () => {
        await StatusBar.hide();
        await NavigationBar.hide();
      });
    } catch (error) {}
  }
}
