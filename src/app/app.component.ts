import { Component, inject, OnInit } from '@angular/core';
import { StatusBar } from '@capacitor/status-bar';
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { firstValueFrom, forkJoin } from 'rxjs';
import { RouteTrackingService } from 'src/modules/core/services/route-tracking.service';
import { AuthService } from 'src/services/auth.service';
import { SessionService } from 'src/services/session.service';
import { WalletService } from 'src/services/wallet.service';
import { LoadClassPassives, LoadItemSetPassives, LoadItemSets } from 'src/store/main.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public walletService = inject(WalletService);
  public tooltipService = inject(NgbTooltipConfig);
  public sessionService = inject(SessionService);
  public authService = inject(AuthService);
  public routeTrackingService = inject(RouteTrackingService);

  constructor(private store: Store) {
    this.lockOrientation();
    this.tooltipService.container = 'body';
    this.tooltipService.openDelay = 200;
  }

  ngOnInit(): void {
    // Cargar datos iniciales de forma paralela
    firstValueFrom(forkJoin([
      this.store.dispatch(new LoadItemSets()),
      this.store.dispatch(new LoadItemSetPassives()),
      this.store.dispatch(new LoadClassPassives())
    ]))
  }

  ngAfterViewInit(): void { }

  async lockOrientation() {
    try {
      await StatusBar.hide();
      await NavigationBar.hide();
      document.addEventListener('resume', async () => {
        await StatusBar.hide();
        await NavigationBar.hide();
      });
    } catch (error) { }
  }
}
