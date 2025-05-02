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
import { Announcement, AnnouncementsService, AnnouncementType } from 'src/services/announcements.service';
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

  public sendVerificationEmail() {
    this.accountService.startEmailVerification();
  }

  public routesNavigation: any[] = [
    {
      path: '/black-market',
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
  public announcementsService = inject(AnnouncementsService);
  public announcements$ = this.announcementsService.getAllAnnouncements();
  public showAnnouncementsBanner = signal(true);
  public currentAnnouncementIndex = signal(0);
  public AnnouncementType = AnnouncementType;

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

  // Method to get the current announcement
  public getCurrentAnnouncement(announcements: Announcement[]): Announcement | null {
    if (!announcements || announcements.length === 0) {
      return null;
    }
    return announcements[this.currentAnnouncementIndex() % announcements.length];
  }

  // Method to navigate to the next announcement
  public nextAnnouncement(announcements: Announcement[]): void {
    if (!announcements || announcements.length <= 1) {
      return;
    }
    this.currentAnnouncementIndex.update(index => (index + 1) % announcements.length);
  }

  // Method to navigate to the previous announcement
  public prevAnnouncement(announcements: Announcement[]): void {
    if (!announcements || announcements.length <= 1) {
      return;
    }
    this.currentAnnouncementIndex.update(index =>
      (index - 1 + announcements.length) % announcements.length
    );
  }

  // Method to close the announcements banner
  public closeAnnouncementsBanner(): void {
    this.showAnnouncementsBanner.set(false);
  }

  // Method to get the icon for an announcement type
  public getAnnouncementIcon(type: AnnouncementType): string {
    switch (type) {
      case AnnouncementType.SYSTEM_RATES:
        return 'fa-solid fa-gauge-high';
      case AnnouncementType.EVENT:
        return 'fa-solid fa-calendar';
      case AnnouncementType.UPDATE:
        return 'fa-solid fa-code-branch';
      case AnnouncementType.MAINTENANCE:
        return 'fa-solid fa-wrench';
      case AnnouncementType.PROMOTION:
        return 'fa-solid fa-tags';
      case AnnouncementType.CUSTOM:
      default:
        return 'fa-solid fa-bullhorn';
    }
  }

  // Method to get the color class for an announcement type
  public getAnnouncementColorClass(type: AnnouncementType): string {
    switch (type) {
      case AnnouncementType.SYSTEM_RATES:
        return 'announcement-system';
      case AnnouncementType.EVENT:
        return 'announcement-event';
      case AnnouncementType.UPDATE:
        return 'announcement-update';
      case AnnouncementType.MAINTENANCE:
        return 'announcement-maintenance';
      case AnnouncementType.PROMOTION:
        return 'announcement-promotion';
      case AnnouncementType.CUSTOM:
      default:
        return 'announcement-custom';
    }
  }

  // Method to check if there are new announcements (within the last 24 hours)
  public hasNewAnnouncements(announcements: Announcement[]): boolean {
    if (!announcements) {
      return false;
    }

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    return announcements.some(announcement => {
      const createdAt = new Date(announcement.createdAt);
      return createdAt > oneDayAgo;
    });
  }

  // Method to format expiry date
  public formatExpiryDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    // If it's today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // If it's tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Otherwise show full date
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
