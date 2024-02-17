import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { disconnect } from '@wagmi/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { calculateXPForLevel } from 'src/modules/utils';
import { AuthService } from 'src/services/auth.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { WalletService } from 'src/services/wallet.service';
import { MainState, MainStateModel } from 'src/store/main.store';
import { ConfirmModalComponent } from '../confirm-modal/confirm.modal.component';

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
      path: '/export-import',
      displayText: 'Import/Export',
      icon: 'fa fa-plug',
    },
    {
      path: '/edit',
      displayText: 'Settings',
      icon: 'fa fa-gear',
    },
    {
      displayText: 'Logout',
      icon: 'fa fa-person-running',
      click: this.logout.bind(this),
    },
  ];

  public isSidebarOpened = signal(true);
  public router = inject(Router);
  public authService = inject(AuthService);
  public accountService = inject(PlayerService);
  public walletService = inject(WalletService);
  public viewportService = inject(ViewportService);
  public store = inject(Store);
  public modalService = inject(BsModalService);

  public toggleSidebarOpened(): void {
    this.isSidebarOpened.update((currentValue) => !currentValue);
  }

  private logout() {
    const isPlayerDisconnected = !this.store.selectSnapshot(MainState.getState)
      .player;

    if (isPlayerDisconnected) {
      return null;
    }

    const config: ModalOptions = {
      initialState: {
        title: 'Logout',
        description: 'Are you sure you want to disconnect?',
        accept: () => {
          disconnect();
          modalRef.hide();
        },
      },
    };
    const modalRef = this.modalService.show(ConfirmModalComponent, config);
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
