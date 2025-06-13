import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { PlayerModel } from 'src/modules/core/models/player.model';
import {
  ChatMessage,
  WebSocketService,
  PrivateConversation,
  ItemAttachment,
} from 'src/services/websocket.service';
import { MainState } from 'src/store/main.store';
import { Item } from 'src/modules/core/models/items.model';
import { Material } from 'src/modules/core/models/material.model';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { MiscellanyItem } from 'src/modules/core/models/misc.model';
import { ContextMenuService } from 'src/services/context-menu.service';
import { ToastrService } from 'ngx-toastr';
import { PlayerStateEnum } from 'src/modules/game/activities/leadeboard/enum/player-state.enum';
import { PlayerService } from 'src/services/player.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {
  isChatExpanded = false;
  currentChatType: 'GLOBAL' | 'PRIVATE' = 'GLOBAL';
  selectedConversation: PrivateConversation | null = null;

  // Mensajes
  globalMessages: ChatMessage[] = [];
  privateMessages: { [recipientId: string]: ChatMessage[] } = {};
  currentMessages: ChatMessage[] = [];

  messageInput = new FormControl('');
  private chatSubscription: Subscription;
  private privateMessagesSubscription: Subscription;
  private privateConversationsSubscription: Subscription;
  private itemAttachmentSubscription: Subscription;
  private onlinePlayersSubscription: Subscription;
  onlinePlayers: { address: string; state: PlayerStateEnum }[] = [];

  public onlinePlayers$ = this.webSocketService.onlinePlayers$;
  public onlineChatPlayers$ = this.webSocketService.onlineChatPlayers$;
  store = inject(Store);
  contextMenuService = inject(ContextMenuService);
  showEmojiSelector = false;
  showPrivateConversations = false;
  showItemPicker = false;

  // New whisper functionality
  showNewWhisperInput = false;
  newWhisperUsername = new FormControl('');

  emojis: string[] = [
    '😀',
    '😂',
    '😍',
    '😎',
    '😭',
    '😅',
    '🔥',
    '👍',
    '🙏',
    '🎉',
    '🥳',
    '😏',
    '😡',
    '😱',
    '🤔',
    '😇',
    '😜',
    '😬',
    '❤️',
    '💀',
    '👀',
    '✨',
    '🤝',
    '😈',
    '😤',
    '😴',
    '🤩',
    '😋',
    '😢',
    '😳',
  ];
  hasUnreadMessages = false;

  // Para el selector de items
  selectedAttachments: {
    items: Item[];
    materials: Material[];
    consumables: Consumable[];
    miscs: MiscellanyItem[];
  } = {
    items: [],
    materials: [],
    consumables: [],
    miscs: [],
  };

  // Conversaciones privadas
  privateConversations: PrivateConversation[] = [];

  // Detalles de items en hover
  hoveredItemDetails: { [key: string]: any } = {};

  @ViewChild('chatContainer') chatContainer: ElementRef;
  @ViewChild('messageInputRef') messageInputRef: ElementRef;
  @ViewChild('usernameContextMenu', { static: true })
  usernameContextMenu: TemplateRef<any>;

  constructor(
    private webSocketService: WebSocketService,
    private toastr: ToastrService,
    private playerService: PlayerService
  ) {}

  ngOnInit() {
    // Suscripción a mensajes globales
    this.chatSubscription = this.webSocketService.chatMessages$.subscribe(
      (messages) => {
        const wasAtBottom = this.isScrolledToBottom();
        this.globalMessages = messages;
        if (this.currentChatType === 'GLOBAL') {
          this.currentMessages = messages;
          console.warn(this.currentMessages);
          if (this.isChatExpanded && wasAtBottom) {
            this.scrollToBottom();
          } else if (!this.isChatExpanded) {
            this.hasUnreadMessages = true;
          }
        }
      }
    );

    // Suscripción a mensajes privados
    this.privateMessagesSubscription =
      this.webSocketService.privateMessages$.subscribe((messages) => {
        const wasAtBottom = this.isScrolledToBottom();
        this.privateMessages = messages;
        if (this.currentChatType === 'PRIVATE' && this.selectedConversation) {
          this.currentMessages =
            messages[this.selectedConversation.otherPlayer.id] || [];
          if (this.isChatExpanded && wasAtBottom) {
            this.scrollToBottom();
          }
        }
      });

    // Suscripción a conversaciones privadas
    this.privateConversationsSubscription =
      this.webSocketService.privateConversations$.subscribe((conversations) => {
        this.privateConversations = conversations;
      });

    // Suscripción a detalles de items
    this.itemAttachmentSubscription =
      this.webSocketService.itemAttachmentDetails$.subscribe(
        (details: ItemAttachment) => {
          this.hoveredItemDetails[`${details.type}_${details.itemId}`] =
            details.details;
        }
      );

    // Suscripción a jugadores en línea
    this.onlinePlayersSubscription =
      this.webSocketService.onlinePlayers$.subscribe((players) => {
        this.onlinePlayers = players;
      });

    this.webSocketService.requestOnlinePlayers();
    this.webSocketService.joinGlobalChat();
    this.webSocketService.getChatHistory();
    this.webSocketService.getPrivateConversations();
  }

  ngOnDestroy() {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
    if (this.privateMessagesSubscription) {
      this.privateMessagesSubscription.unsubscribe();
    }
    if (this.privateConversationsSubscription) {
      this.privateConversationsSubscription.unsubscribe();
    }
    if (this.itemAttachmentSubscription) {
      this.itemAttachmentSubscription.unsubscribe();
    }
    if (this.onlinePlayersSubscription) {
      this.onlinePlayersSubscription.unsubscribe();
    }
    this.webSocketService.leaveGlobalChat();
  }

  sendMessage() {
    const message = this.messageInput.value?.trim();
    const hasAttachments = this.hasSelectedAttachments();

    if (!message && !hasAttachments) return;

    const attachments = hasAttachments
      ? {
          items: this.selectedAttachments.items.map((item) =>
            item.id.toString()
          ),
          materials: this.selectedAttachments.materials.map((material) =>
            material.materialDataId.toString()
          ),
          consumables: this.selectedAttachments.consumables.map((consumable) =>
            consumable.consumableDataId.toString()
          ),
          miscs: this.selectedAttachments.miscs.map((misc) =>
            misc.miscellanyItemDataId.toString()
          ),
        }
      : undefined;

    if (this.currentChatType === 'GLOBAL') {
      this.webSocketService.sendMessage(message || '', attachments);
    } else if (this.selectedConversation) {
      this.webSocketService.sendPrivateMessage(
        this.selectedConversation.otherPlayer.id,
        message || '',
        attachments
      );
    }

    this.messageInput.reset();
    this.clearAttachments();
  }

  switchToGlobalChat() {
    this.currentChatType = 'GLOBAL';
    this.selectedConversation = null;
    this.currentMessages = this.globalMessages;
    this.showPrivateConversations = false;
    this.scrollToBottom();
  }

  switchToPrivateChat(conversation: PrivateConversation) {
    this.currentChatType = 'PRIVATE';
    this.selectedConversation = conversation;
    this.showPrivateConversations = false;

    // Cargar historial de la conversación
    this.webSocketService.getPrivateChatHistory(conversation.otherPlayer.id);
    this.currentMessages =
      this.privateMessages[conversation.otherPlayer.id] || [];
    this.scrollToBottom();
  }

  toggleChat() {
    this.isChatExpanded = !this.isChatExpanded;
    this.showEmojiSelector = false;
    this.showPrivateConversations = false;
    this.showItemPicker = false;
    if (this.isChatExpanded) {
      this.hasUnreadMessages = false;
      this.scrollToBottom();
    }
  }

  togglePrivateConversations() {
    this.currentChatType = 'PRIVATE';
    this.showPrivateConversations = !this.showPrivateConversations;
    this.showEmojiSelector = false;
    this.showItemPicker = false;
    if (this.showPrivateConversations) {
      this.webSocketService.getPrivateConversations();
    }
  }

  toggleEmojiSelector() {
    this.showEmojiSelector = !this.showEmojiSelector;
    this.showPrivateConversations = false;
    this.showItemPicker = false;
  }

  toggleItemPicker() {
    this.showItemPicker = !this.showItemPicker;
    this.showEmojiSelector = false;
    this.showPrivateConversations = false;
  }

  addEmoji(emoji: string) {
    const current = this.messageInput.value || '';
    this.messageInput.setValue(current + emoji);
    this.showEmojiSelector = false;
    setTimeout(() => {
      if (this.messageInputRef) {
        this.messageInputRef.nativeElement.focus();
      }
    });
  }

  onItemSelection(selection: {
    selectedItems: Item[];
    selectedMaterials: Material[];
    selectedConsumables: Consumable[];
    selectedMiscs: MiscellanyItem[];
  }) {
    this.selectedAttachments = {
      items: selection.selectedItems,
      materials: selection.selectedMaterials,
      consumables: selection.selectedConsumables,
      miscs: selection.selectedMiscs,
    };
    this.showItemPicker = false;
  }

  hasSelectedAttachments(): boolean {
    return (
      this.selectedAttachments.items.length > 0 ||
      this.selectedAttachments.materials.length > 0 ||
      this.selectedAttachments.consumables.length > 0 ||
      this.selectedAttachments.miscs.length > 0
    );
  }

  clearAttachments() {
    this.selectedAttachments = {
      items: [],
      materials: [],
      consumables: [],
      miscs: [],
    };
  }

  onItemHover(
    itemId: string,
    type: 'item' | 'material' | 'consumable' | 'misc'
  ) {
    const key = `${type}_${itemId}`;
    if (!this.hoveredItemDetails[key]) {
      this.webSocketService.getItemAttachmentDetails(itemId, type);
    }
  }

  getItemDetails(
    itemId: string,
    type: 'item' | 'material' | 'consumable' | 'misc'
  ) {
    const key = `${type}_${itemId}`;
    return this.hoveredItemDetails[key];
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer) {
        const element = this.chatContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    });
  }

  private isScrolledToBottom(): boolean {
    if (!this.chatContainer) return true;
    const el = this.chatContainer.nativeElement;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 30;
  }

  getCurrentUsername(): string {
    return (
      (this.store.selectSnapshot(MainState.getState)?.player as PlayerModel)
        ?.name || ''
    );
  }

  getCurrentUserId(): string {
    return (
      (this.store.selectSnapshot(MainState.getState)?.player as PlayerModel)
        ?.id || ''
    );
  }

  getPlayerNameColor(username: string): { color: string } {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = (hash % 50) + 180;
    const s = 70;
    const l = 60;

    return {
      color: `hsl(${h}, ${s}%, ${l}%)`,
    };
  }

  getChatTitle(): string {
    if (this.currentChatType === 'GLOBAL') {
      return 'Chat';
    } else if (this.selectedConversation) {
      return `Chat with ${this.selectedConversation.otherPlayer.name}`;
    }
    return 'Chat';
  }

  startPrivateChat(playerId: string, playerName: string) {
    const conversation: PrivateConversation = {
      otherPlayer: {
        id: playerId,
        name: playerName,
        image: '/assets/default-avatar.png', // placeholder
      },
      lastMessageAt: new Date(),
      lastMessage: '',
    };
    this.switchToPrivateChat(conversation);
  }

  // Context menu methods
  onUsernameRightClick(event: MouseEvent, message: ChatMessage) {
    // No mostrar menú contextual para mensajes propios
    if (message.username === this.getCurrentUsername()) {
      return;
    }

    // Prevenir el menú contextual nativo
    event.preventDefault();
    event.stopPropagation();

    // Mostrar menú contextual con información del usuario
    this.contextMenuService.onContextMenu(event, this.usernameContextMenu, {
      username: message.username,
      senderId: message.senderId,
      message: message,
    });
  }

  onSendWhisper(context: any) {
    const username = context.username;
    const senderId = context.senderId;

    if (senderId) {
      this.startPrivateChat(senderId, username);
    }

    this.contextMenuService.hideContextMenu();
  }

  onCloseContextMenu() {
    this.contextMenuService.hideContextMenu();
  }

  // New whisper methods
  toggleNewWhisperInput() {
    this.showNewWhisperInput = !this.showNewWhisperInput;
    if (this.showNewWhisperInput) {
      this.newWhisperUsername.setValue('');
      // Focus el input después de que se renderice
      setTimeout(() => {
        const input = document.querySelector(
          '.new-whisper-input'
        ) as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    }
  }

  startNewWhisper() {
    const username = this.newWhisperUsername.value?.trim();
    if (!username) return;

    // Check if we already have a conversation with this user
    const existingConversation = this.privateConversations.find(
      (conv) => conv.otherPlayer.name.toLowerCase() === username.toLowerCase()
    );

    if (existingConversation) {
      // Switch to existing conversation
      this.switchToPrivateChat(existingConversation);
    } else {
      // Search for the player by name
      this.playerService.getPlayerByUsername(username).subscribe((foundPlayer) => {
      

        if (!foundPlayer) {
          this.toastr.error('Player not found');
          return;
        }
        const isOnline = this.onlinePlayers.some(
          (p) => p.address === foundPlayer.id
        );
        if (!isOnline) {
          this.toastr.error('Player is not online');
          return;
        }
        // Create a new conversation with the found player
        const newConversation: PrivateConversation = {
          otherPlayer: {
            id: foundPlayer.id,
            name: foundPlayer.name,
            image: foundPlayer.image || '/assets/default-avatar.png',
          },
          lastMessageAt: new Date(),
          lastMessage: 'Start your conversation...',
        };

        // Add to our local conversations list
        this.privateConversations.unshift(newConversation);
        this.switchToPrivateChat(newConversation);
      });
    }

    this.showNewWhisperInput = false;
    this.newWhisperUsername.setValue('');
  }

  cancelNewWhisper() {
    this.showNewWhisperInput = false;
    this.newWhisperUsername.setValue('');
  }
}
