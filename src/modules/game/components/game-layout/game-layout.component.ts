import { Component, TemplateRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { disconnect } from '@wagmi/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { calculateXPForLevel } from 'src/modules/utils';
import { AuthService } from 'src/services/auth.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { WalletService } from 'src/services/wallet.service';
import {
  DisconnectWallet,
  MainState,
  MainStateModel,
} from 'src/store/main.store';
import { ConfirmModalComponent } from '../confirm-modal/confirm.modal.component';

@Component({
  selector: 'app-game-layout',
  templateUrl: './game-layout.component.html',
  styleUrl: './game-layout.component.scss',
})
export class GameLayoutComponent {
  @Select(MainState.getState) state$: Observable<MainStateModel>;
  private displayPVE = false;
  public walletService = inject(WalletService);

  public getActiveRoute = () => {
    return this.routesNavigation.find((entry) => entry.path == this.router.url);
  };
  public routesNavigation = [
    {
      path: '/inventory',
      displayText: 'Character',
      icon: 'fa fa-shield-halved',
    },
    {
      displayText: 'PvE',
      icon: 'fa-solid fa-dragon',
      nested: true,
      expanded: () => !!this.displayPVE,
      class: () => {
        return !!this.displayPVE ? 'text-white' : '';
      },
      click: () => {
        this.displayPVE = !this.displayPVE;
      },
    },
    {
      path: '/quests',
      displayText: 'Quests',
      icon: 'fa fa-signs-post',
      class: () => 'bg-secondary nested',
      display: () => {
        return !!this.displayPVE;
      },
    },
    {
      path: '/adventures',
      displayText: 'Adventures',
      icon: 'fa fa-map',
      class: () => 'bg-secondary nested',
      display: () => {
        return !!this.displayPVE;
      },
    },
    {
      path: '/shop',
      displayText: 'Shop',
      icon: 'fa fa-shop',
    },
    {
      path: '/blacksmith',
      displayText: 'Blacksmith',
      icon: 'fa fa-hammer',
    },
    {
      path: '/leaderboard',
      displayText: 'Leaderboards',
      icon: 'fas fa-users',
    },
    {
      path: '/export-import',
      displayText: 'Import/Export',
      icon: 'fa fa-bridge',
      onlyWeb3: true,
    },
    {
      path: '/edit',
      displayText: 'Settings',
      icon: 'fa fa-gear',
    },
    {
      displayText: 'Logout',
      icon: 'fa fa-right-from-bracket',
      click: this.logout.bind(this),
    },
  ];

  public isSidebarOpened = signal(true);
  public router = inject(Router);
  public activeRoute = inject(ActivatedRoute);
  public authService = inject(AuthService);
  public accountService = inject(PlayerService);
  public viewportService = inject(ViewportService);
  public store = inject(Store);
  public modalService = inject(BsModalService);
  public displayingFullScreenModal = false;
  modalRef?: BsModalRef;
  public loggedWithemail = this.authService.loggedWithEmail;

  public toggleSidebarOpened(): void {
    this.isSidebarOpened.update((currentValue) => !currentValue);
  }

  public displayFullScreenDialog(template: TemplateRef<void>): void {
    this.displayingFullScreenModal = true;
    this.modalRef = this.modalService.show(template, {
      class: 'mobile-menu',
      backdrop: true,
    });
    this.modalRef.onHide.subscribe(
      () => (this.displayingFullScreenModal = false)
    );
  }

  private logout() {
    const config: ModalOptions = {
      initialState: {
        title: 'Logout',
        description: 'Are you sure you want to disconnect?',
        accept: () => {
          this.store.dispatch(new DisconnectWallet());
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

  public getPlayerImageSize() {
    if (
      this.viewportService.screenSize === 'xs' ||
      this.viewportService.screenSize === 'sm' ||
      this.viewportService.screenSize === 'md'
    ) {
      return 32;
    }
    return 50;
  }
}
