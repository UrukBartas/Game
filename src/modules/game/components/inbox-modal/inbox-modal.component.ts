import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  SecurityContext,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { isEmpty } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { MarkdownComponent, provideMarkdown } from 'ngx-markdown';
import { take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SubtextSizeDirective } from 'src/modules/core/directives/subtext-size.directive';
import { TextSizeDirective } from 'src/modules/core/directives/text-size.directive';
import { NotificationModel } from 'src/modules/core/models/notifications.model';
import { NotificationsService } from 'src/services/notifications.service';
import { ViewportService } from 'src/services/viewport.service';
import { GenericItemTooltipComponent } from 'src/standalone/generic-item-tooltip/generic-item-tooltip.component';
import { ItemBoxComponent } from 'src/standalone/item-box/item-box.component';
import { MainState, SetNotifications } from 'src/store/main.store';
import { InventoryUpdateService } from '../../activities/inventory/services/inventory-update.service';

@Component({
  selector: 'app-inbox-modal',
  standalone: true,
  imports: [
    TextSizeDirective,
    SubtextSizeDirective,
    MarkdownComponent,
    ItemBoxComponent,
    GenericItemTooltipComponent,
    CommonModule,
  ],
  providers: [provideMarkdown({ sanitize: SecurityContext.NONE })],
  templateUrl: './inbox-modal.component.html',
  styleUrl: './inbox-modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class InboxModalComponent implements OnInit {
  modalRef = inject(BsModalRef);
  store = inject(Store);
  notificationService = inject(NotificationsService);
  viewportService = inject(ViewportService);
  inventoryUpdateService = inject(InventoryUpdateService);
  state = this.store.select(MainState.getState);
  playerId: string;
  openedNotification: NotificationModel;
  attachments: { data; quantity: number }[];
  public prefix = environment.permaLinkImgPref;
  ngOnInit(): void {
    this.playerId = this.store.selectSnapshot(MainState.getState).player?.id;
    this.refreshNotifications();
  }

  private refreshNotifications() {
    this.notificationService
      .getNotifications()
      .pipe(take(1))
      .subscribe((notifications) =>
        this.store.dispatch(new SetNotifications(notifications))
      );
  }

  openNotification(notification: NotificationModel) {
    this.openedNotification = notification;
    this.attachments = null;
    if (!notification.opened.includes(this.playerId)) {
      this.notificationService
        .openNotification(notification.id)
        .pipe(take(1))
        .subscribe(() => this.refreshNotifications());
    }
    if (!isEmpty(notification.attachments)) {
      this.notificationService
        .getAttachments(notification.id)
        .pipe(take(1))
        .subscribe((attachments) => (this.attachments = attachments));
    }
  }

  claimItems(notification: NotificationModel) {
    if (!notification.claimed.includes(this.playerId)) {
      this.notificationService
        .claimAttachments(notification.id)
        .pipe(take(1))
        .subscribe(() => {
          this.openedNotification.claimed.push(this.playerId);
          this.inventoryUpdateService.updateAllInventory$.next(true);
        });
    }
  }

  hasAttachments(notification: NotificationModel): boolean {
    return (
      !notification.claimed.includes(this.playerId) &&
      !isEmpty(notification.attachments)
    );
  }

  getItemBoxSize(): number {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 60;
      case 'md':
      case 'xs':
      case 'sm':
      default:
        return 40;
    }
  }
}
