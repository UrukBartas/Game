import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  SecurityContext,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { isEmpty } from 'lodash-es';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { MarkdownComponent, provideMarkdown } from 'ngx-markdown';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
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
    FormsModule,
  ],
  providers: [provideMarkdown({ sanitize: SecurityContext.NONE })],
  templateUrl: './inbox-modal.component.html',
  styleUrl: './inbox-modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class InboxModalComponent implements OnInit {
  modalRef = inject(BsModalRef);
  toast = inject(ToastrService);
  store = inject(Store);
  notificationService = inject(NotificationsService);
  viewportService = inject(ViewportService);
  inventoryUpdateService = inject(InventoryUpdateService);
  notifications$ = this.store.select(MainState.getNotifications);
  playerId: string;
  openedNotification: NotificationModel;
  attachments: { data; quantity: number }[];
  public prefix = ViewportService.getPreffixImg();

  // ✅ NUEVAS PROPIEDADES PARA SELECCIÓN MÚLTIPLE
  selectionMode = false; // Estado del toggle switch
  selectedNotifications: NotificationModel[] = []; // Lista de notificaciones seleccionadas
  allSelected = false; // Indica si todas las notificaciones están seleccionadas

  ngOnInit(): void {
    this.playerId = this.store.selectSnapshot(MainState.getState).player?.id;
    this.refreshNotifications();
  }

  private refreshNotifications() {
    this.notificationService
      .getNotifications()
      .pipe(take(1))
      .subscribe((response) =>
        this.store.dispatch(new SetNotifications(response))
      );
  }

  openNotification(notification: NotificationModel) {
    if (!this.selectionMode) {
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
    } else {
      this.toggleSelection(notification);
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

  prevPage() {
    const notifications = this.store.selectSnapshot(MainState.getNotifications);
    this.notificationService
      .getNotifications(notifications.currentPage - 1)
      .pipe(take(1))
      .subscribe((response) =>
        this.store.dispatch(new SetNotifications(response))
      );
  }

  nextPage() {
    const notifications = this.store.selectSnapshot(MainState.getNotifications);
    this.notificationService
      .getNotifications(notifications.currentPage + 1)
      .pipe(take(1))
      .subscribe((response) =>
        this.store.dispatch(new SetNotifications(response))
      );
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.selectedNotifications = [];
    } else {
      this.selectedNotifications = [
        ...this.store.selectSnapshot(MainState.getNotifications).notifications,
      ];
    }
    this.allSelected = !this.allSelected;
  }

  // ✅ FUNCIONES PARA MANEJO DE SELECCIÓN MÚLTIPLE

  /**
   * Alterna el estado de selección de una notificación
   */
  toggleSelection(notification: NotificationModel) {
    const index = this.selectedNotifications.findIndex(
      (n) => n.id === notification.id
    );
    if (index > -1) {
      this.selectedNotifications.splice(index, 1);
    } else {
      this.selectedNotifications.push(notification);
    }
  }

  /**
   * Marca todas las notificaciones seleccionadas como leídas
   */
  markSelectedAsRead() {
    if (this.selectedNotifications.length === 0) return;

    // Simular el cambio de estado en el frontend
    this.selectedNotifications.forEach((notification) => {
      if (!notification.opened.includes(this.playerId)) {
        notification.opened.push(this.playerId);
      }
    });

    // Enviar la actualización al backend
    this.notificationService
      .setSelectionToRead(this.selectedNotifications.map((n) => n.id))
      .pipe(take(1))
      .subscribe((msg: any) => {
        this.allSelected = false;
        this.selectedNotifications = []; // Vaciar la selección
        this.selectionMode = false; // Desactivar el modo selección
        this.refreshNotifications(); // Actualizar el estado en el store
        this.toast.success(msg.message);
      });
  }
}
