import { DecimalPipe } from '@angular/common';
import { Component, inject, signal, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { Select, Store } from '@ngxs/store';
import { Memoize } from 'lodash-decorators';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { map, Observable, switchMap } from 'rxjs';
import { NotificationResponseModel } from 'src/modules/core/models/notifications.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { CompressNumberPipe } from 'src/modules/core/pipes/compress-number.pipe';
import { calculateXPForLevel } from 'src/modules/utils';
import { AuthService } from 'src/services/auth.service';
import { BoardMissionService } from 'src/services/board-mission.service';
import { PlayerService } from 'src/services/player.service';
import { QuestTimerService } from 'src/services/quest-timer.service';
import { ViewportService } from 'src/services/viewport.service';
import { WalletService } from 'src/services/wallet.service';
import {
  DisconnectWallet,
  MainState,
  MainStateModel,
} from 'src/store/main.store';
import { ConfirmModalComponent } from '../confirm-modal/confirm.modal.component';
import { InboxModalComponent } from '../inbox-modal/inbox-modal.component';

@Component({
  selector: 'app-game-layout',
  templateUrl: './game-layout.component.html',
  styleUrl: './game-layout.component.scss',
})
export class GameLayoutComponent {
  @Select(MainState.getState) state$: Observable<MainStateModel>;
  public walletService = inject(WalletService);
  boardService = inject(BoardMissionService);
  public getActiveRoute = () => {
    return this.routesNavigation.find((entry) => entry.path == this.router.url);
  };
  public prefix = ViewportService.getPreffixImg();
  store = inject(Store);
  player$ = this.store
    .select(MainState.getState)
    .pipe(map((entry) => entry.player));
  public playerActiveMission$ = this.player$.pipe(switchMap(() => this.boardService.getPlayerActiveMission()));
  @Memoize()
  public filteredRoutes(routesNavigation: any[]) {
    return routesNavigation.filter((route) => {
      if (route.onlyWeb3 && this.loggedWithemail()) {
        return false;
      }
      return true;
    });
  }
  public routesNavigation: any[] = [
    {
      path: '/presale',
      displayText: 'Black market',
      icon: 'text-rainbow fa fa-skull-crossbones',
    },
    {
      path: '/inventory',
      displayText: 'Character',
      icon: 'fa fa-shield-halved',
    },
    {
      path: '/missions',
      displayText: 'Missions',
      icon: 'fa-solid fa-dragon',
    },
    {
      path: '/shopping',
      displayText: 'Shopping',
      icon: 'fa fa-shop',
    },
    {
      path: '/tavern',
      displayText: 'Tavern',
      icon: 'fa fa-beer-mug-empty',
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
      path: '/the-mine',
      displayText: 'The Mine',
      icon: 'fa fa-gem',
      onlyWeb3: true,
    },
    {
      path: '/export-import',
      displayText: 'Bridge',
      icon: 'fa fa-bridge',
      onlyWeb3: true,
    },
    {
      path: 'https://app.magicsea.finance/swap?inputCurrency=0x4ab1edfe2706fcac991a41183036e62a8f1dabd3&outputCurrency=IOTA',
      displayText: 'Get $URUKS',
      class: 'buy-uruks',
      contentClass: 'animate__animated animate__pulse animate__infinite',
      external: true,
      image: this.prefix + '/assets/goldenuruks_compact.png',
    },
  ];
  public isSidebarOpened = signal(true);
  public router = inject(Router);
  public activeRoute = inject(ActivatedRoute);
  public authService = inject(AuthService);
  public accountService = inject(PlayerService);
  public viewportService = inject(ViewportService);
  private _modalService = inject(BsModalService);
  public get modalService() {
    return this._modalService;
  }
  public set modalService(value) {
    this._modalService = value;
  }
  public questTimerService = inject(QuestTimerService);
  public decimalPipe = inject(DecimalPipe);
  public compressNumber = inject(CompressNumberPipe);
  public displayingFullScreenModal = false;
  public modalRef?: BsModalRef;
  public loggedWithemail = this.authService.loggedWithEmail;
  public notifications$: Observable<NotificationResponseModel> =
    this.store.select(MainState.getNotifications);

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

  public logout() {
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

  public openInbox() {
    this.modalService.show(InboxModalComponent);
  }

  getProgressBarData(player: PlayerModel) {
    const totalExp = calculateXPForLevel(player.level);
    return {
      text: `${this.compressNumber.transform(player.experience)}/${this.compressNumber.transform(totalExp)}`,
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
      return 40;
    }
    return 50;
  }

  ngAfterViewInit(): void {
    const tutorial = this.getTutorial();
    if (tutorial) {
      const routePath =
        this.activeRoute.firstChild?.snapshot.routeConfig?.path || 'default';
      const tutorialKey = `tutorialShown_${routePath}`;

      Preferences.get({ key: tutorialKey }).then((result) => {
        if (!result.value) {
          this.displayTutorial();
          Preferences.set({ key: tutorialKey, value: 'true' });
        }
      });
    }
  }

  private getTutorial() {
    const childRoute = this.activeRoute.firstChild;
    const tutorial = (childRoute?.snapshot?.data as any)?.tutorial;
    return tutorial;
  }

  public hasTutorial() {
    const tutorial = this.getTutorial();
    return tutorial;
  }

  public displayTutorial() {
    const tutorial = this.getTutorial();
    this.modalService.show(tutorial);
  }
}
