import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouteTrackingService } from 'src/modules/core/services/route-tracking.service';
import { PvPFightService } from 'src/services/pvp-fight.service';

@Component({
  selector: 'app-pvp-result',
  templateUrl: './pvp-result.component.html',
  styleUrls: ['./pvp-result.component.scss'],
})
export class PvPResultComponent {
  public fightService = inject(PvPFightService);
  public router = inject(Router);
  public routeTrackingService = inject(RouteTrackingService);
  public getLastMatch$ = this.fightService.getLastMatch();
  private allowedRoutes = ['/arena/auto', '/arena/pvp'];

  constructor() {
    this.handleRouting();
  }

  private handleRouting(): void {
    console.log(this.router);
    
    const lastRoute = this.routeTrackingService.getPreviousUrl();
    if (!this.allowedRoutes.includes(lastRoute)) {
      this.router.navigate(['/leaderboard']);
    }
  }
}
