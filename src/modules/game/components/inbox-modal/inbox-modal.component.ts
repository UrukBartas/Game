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
import { Subject, debounceTime, distinctUntilChanged, of, switchMap, take } from 'rxjs';
import { SubtextSizeDirective } from 'src/modules/core/directives/subtext-size.directive';
import { TextSizeDirective } from 'src/modules/core/directives/text-size.directive';
import { NotificationModel } from 'src/modules/core/models/notifications.model';
import { NotificationsService } from 'src/services/notifications.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { GenericItemTooltipComponent } from 'src/standalone/generic-item-tooltip/generic-item-tooltip.component';
import { ItemBoxComponent } from 'src/standalone/item-box/item-box.component';
import { MainState, SetNotifications } from 'src/store/main.store';
import { InventoryUpdateService } from '../../activities/inventory/services/inventory-update.service';

interface PlayerSuggestion {
  id: string;
  name: string;
  image: string;
}

interface NewMessage {
  recipientName: string;
  subject: string;
  content: string;
}

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
  playerService = inject(PlayerService);

  notifications$ = this.store.select(MainState.getNotifications);
  playerId: string;
  openedNotification: NotificationModel;
  attachments: { data; quantity: number }[];
  public prefix = ViewportService.getPreffixImg();

  // Propiedades para selección múltiple
  selectionMode = false;
  selectedNotifications: NotificationModel[] = [];
  allSelected = false;

  // Propiedades para composición de mensajes
  composingMessage = false;
  newMessage: NewMessage = {
    recipientName: '',
    subject: '',
    content: ''
  };
  recipientSuggestions: PlayerSuggestion[] = [];
  searchingPlayers = false;

  private searchTerms = new Subject<string>();
  messageType: 'inbox' | 'sent' = 'inbox'; // Para alternar entre mensajes recibidos y enviados
  remainingMessages: number = 0;
  currentNotifications: any = { notifications: [], totalPages: 1, currentPage: 1 };

  ngOnInit(): void {
    this.playerId = this.store.selectSnapshot(MainState.getState).player?.id;
    this.loadInboxMessages();
    this.getRemainingMessages();

    // Configurar la búsqueda con debounce
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => term.length >= 3 ? this.playerService.searchPlayers(term) : of([]))
    ).subscribe(results => {
      this.recipientSuggestions = results.map(player => ({
        id: player.id,
        name: player.name,
        image: player.image || '/assets/default-avatar.png'
      }));
      this.searchingPlayers = false;
    });
  }

  private loadInboxMessages(page = 1, pageSize = 10) {
    this.notificationService
      .getNotifications(page, pageSize)
      .pipe(take(1))
      .subscribe(response => {
        this.currentNotifications = response;
        this.store.dispatch(new SetNotifications(response));
      });
  }

  private loadSentMessages(page = 1, pageSize = 10) {
    this.notificationService
      .getSentMessages(page, pageSize)
      .pipe(take(1))
      .subscribe(response => {
        this.currentNotifications = response;
        this.store.dispatch(new SetNotifications(response));
      });
  }

  openNotification(notification: NotificationModel) {
    if (!this.selectionMode) {
      this.openedNotification = notification;
      this.attachments = null;
      if (!notification.opened.includes(this.playerId)) {
        this.notificationService
          .openNotification(notification.id)
          .pipe(take(1))
          .subscribe(() => {
            if (this.messageType === 'inbox') {
              this.loadInboxMessages(this.currentNotifications.currentPage);
            }
          });
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
    const currentPage = this.currentNotifications.currentPage;
    if (currentPage > 1) {
      if (this.messageType === 'inbox') {
        this.loadInboxMessages(currentPage - 1);
      } else {
        this.loadSentMessages(currentPage - 1);
      }
    }
  }

  nextPage() {
    const currentPage = this.currentNotifications.currentPage;
    const totalPages = this.currentNotifications.totalPages;
    if (currentPage < totalPages) {
      if (this.messageType === 'inbox') {
        this.loadInboxMessages(currentPage + 1);
      } else {
        this.loadSentMessages(currentPage + 1);
      }
    }
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.selectedNotifications = [];
    } else {
      this.selectedNotifications = [...this.currentNotifications.notifications];
    }
    this.allSelected = !this.allSelected;
  }

  // Funciones para manejo de selección múltiple
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

  markSelectedAsRead() {
    if (this.selectedNotifications.length === 0) return;

    const unreadNotifications = this.selectedNotifications.filter(
      (notification) => !notification.opened.includes(this.playerId)
    );

    if (unreadNotifications.length === 0) {
      this.toast.info('All selected messages are already read');
      return;
    }

    const notificationIds = unreadNotifications.map((n) => n.id);
    this.notificationService
      .setSelectionToRead(notificationIds)
      .pipe(take(1))
      .subscribe(() => {
        if (this.messageType === 'inbox') {
          this.loadInboxMessages(this.currentNotifications.currentPage);
        } else {
          this.loadSentMessages(this.currentNotifications.currentPage);
        }
        this.toast.success(
          `Marked ${unreadNotifications.length} messages as read`
        );
        this.selectedNotifications = [];
        this.allSelected = false;
      });
  }

  deleteSelected() {
    if (this.selectedNotifications.length === 0) return;

    const notificationIds = this.selectedNotifications.map((n) => n.id);
    this.notificationService
      .deleteMultiple(notificationIds)
      .pipe(take(1))
      .subscribe(() => {
        if (this.messageType === 'inbox') {
          this.loadInboxMessages(this.currentNotifications.currentPage);
        } else {
          this.loadSentMessages(this.currentNotifications.currentPage);
        }
        this.toast.success(
          `Deleted ${this.selectedNotifications.length} messages`
        );
        this.selectedNotifications = [];
        this.allSelected = false;
      });
  }

  // Funciones para composición de mensajes
  showComposeMessage() {
    this.composingMessage = true;
    this.newMessage = {
      recipientName: '',
      subject: '',
      content: ''
    };
    this.recipientSuggestions = [];
  }

  cancelComposeMessage() {
    this.composingMessage = false;
  }

  onRecipientInput() {
    if (this.newMessage.recipientName.length >= 3) {
      this.searchingPlayers = true;
      this.searchTerms.next(this.newMessage.recipientName);
    } else {
      this.recipientSuggestions = [];
    }
  }

  selectRecipient(player: PlayerSuggestion) {
    this.newMessage.recipientName = player.name;
    this.recipientSuggestions = [];
  }

  canSendMessage(): boolean {
    return (
      !!this.newMessage.recipientName &&
      !!this.newMessage.subject &&
      !!this.newMessage.content &&
      this.newMessage.subject.length > 0 &&
      this.newMessage.content.length > 0
    );
  }

  sendMessage() {
    if (!this.canSendMessage()) {
      return;
    }

    this.notificationService
      .sendMessage({
        recipientName: this.newMessage.recipientName,
        subject: this.newMessage.subject,
        content: this.newMessage.content
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toast.success('Your raven has been sent successfully!');
          this.composingMessage = false;
          this.getRemainingMessages();
          // Cargar mensajes enviados después de enviar uno nuevo
          if (this.messageType === 'sent') {
            this.loadSentMessages();
          } else {
            this.loadInboxMessages();
          }
        },
        error: (error) => {
          this.toast.error(`Failed to send message: ${error.message || 'Unknown error'}`);
        }
      });
  }

  replyToMessage(notification: NotificationModel) {
    this.composingMessage = true;
    this.newMessage = {
      recipientName: notification.sender?.name || '',
      subject: `Re: ${notification.title}`,
      content: `\n\n---\n> Original message from ${notification.sender?.name || 'Unknown'}:\n> ${notification.content.replace(/\n/g, '\n> ')}`
    };
  }

  // Método para obtener mensajes restantes
  getRemainingMessages() {
    this.notificationService.getRemainingMessages()
      .pipe(take(1))
      .subscribe(response => {
        this.remainingMessages = response.remaining;
      });
  }

  // Método para cambiar entre mensajes recibidos y enviados
  toggleMessageType(type: 'inbox' | 'sent') {
    if (this.messageType !== type) {
      this.messageType = type;
      this.openedNotification = null;
      this.selectedNotifications = [];
      this.allSelected = false;

      if (type === 'inbox') {
        this.loadInboxMessages();
      } else {
        this.loadSentMessages();
      }
    }
  }
}