import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { PlayerService } from 'src/services/player.service';
import { AuthService } from 'src/services/auth.service';
import { WalletService } from 'src/services/wallet.service';
import { MainState, MainStateModel } from 'src/store/main.store';
import { ViewportService } from 'src/services/viewport.service';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { calculateXPForLevel } from 'src/modules/utils';

@Component({
  selector: 'app-game-layout',
  templateUrl: './game-layout.component.html',
  styleUrl: './game-layout.component.scss',
})
export class GameLayoutComponent {
  @Select(MainState.getState) state$: Observable<MainStateModel>;

  public routesNavigation = [
    {
      path: '/inventory',
      displayText: 'Character',
      icon: 'fa fa-shield-halved',
    },
    {
      path: '/quests',
      displayText: 'Quests',
      icon: 'fa fa-map',
    },
    {
      path: '/leaderboard',
      displayText: 'Leaderboards',
      icon: 'fas fa-users',
    },
    {
      path: '/export-import',
      displayText: 'Import/Export',
      icon: 'fa fa-plug',
    },
    {
      path: '/edit',
      displayText: 'Settings',
      icon: 'fa fa-gear',
    },
  ];

  public isSidebarOpened = signal(true);
  public router = inject(Router);
  public authService = inject(AuthService);
  public accountService = inject(PlayerService);
  public walletService = inject(WalletService);
  public viewportService = inject(ViewportService);

  public toggleSidebarOpened(): void {
    this.isSidebarOpened.update((currentValue) => !currentValue);
  }

  getProgressBarData(player: PlayerModel) {
    const totalExp = calculateXPForLevel(player.level);
    return {
      text: `${player.experience}/${totalExp}`,
      percent: (player.experience / totalExp) * 100,
    };
  }

  getProgressBarHeight() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 30;
      case 'md':
      case 'xs':
      case 'sm':
      default:
        return 20;
    }
  }
}
