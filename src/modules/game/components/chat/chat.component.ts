import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { ChatMessage, WebSocketService } from 'src/services/websocket.service';
import { MainState } from 'src/store/main.store';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy {
  isChatExpanded = false;
  messages: ChatMessage[] = [];
  messageInput = new FormControl('');
  private chatSubscription: Subscription;
  public onlinePlayers$ = this.webSocketService.onlineChatPlayers$;
  store = inject(Store);
  showEmojiSelector = false;
  emojis: string[] = [
    '😀','😂','😍','😎','😭','😅','🔥','👍','🙏','🎉','🥳','😏','😡','😱','🤔','😇','😜','😬','❤️','💀','👀','✨','🤝','😈','😤','😴','🤩','😋','😢','😳'
  ];
  hasUnreadMessages = false;

  @ViewChild('chatContainer') chatContainer: ElementRef;
  @ViewChild('messageInputRef') messageInputRef: ElementRef;

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
    this.chatSubscription = this.webSocketService.chatMessages$.subscribe(
      messages => {
        const wasAtBottom = this.isScrolledToBottom();
        this.messages = messages;
        if (this.isChatExpanded && wasAtBottom) {
          this.scrollToBottom();
        } else if (!this.isChatExpanded) {
          this.hasUnreadMessages = true;
        }
      }
    );
    this.webSocketService.requestOnlinePlayers();
    this.webSocketService.joinGlobalChat();
    this.webSocketService.getChatHistory();
  }

  ngOnDestroy() {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
    this.webSocketService.leaveGlobalChat();
  }

  sendMessage() {
    const message = this.messageInput.value?.trim();
    if (message) {
      this.webSocketService.sendMessage(message);
      this.messageInput.reset();
    }
  }

  toggleChat() {
    this.isChatExpanded = !this.isChatExpanded;
    this.showEmojiSelector = false;
    if (this.isChatExpanded) {
      this.hasUnreadMessages = false;
      this.scrollToBottom();
    }
  }

  toggleEmojiSelector() {
    this.showEmojiSelector = !this.showEmojiSelector;
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
    // Considera "abajo" si está a 30px del fondo o menos
    return el.scrollHeight - el.scrollTop - el.clientHeight < 30;
  }

  getCurrentUsername(): string {
    return ((this.store.selectSnapshot(MainState.getState))?.player as PlayerModel)?.name || '';
  }

  getPlayerNameColor(username: string): { color: string } {
    // Genera un color basado en el nombre de usuario
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Genera un tono de azul/verde para que sea legible
    const h = hash % 50 + 180; // Rango de 180-230 (tonos de azul/verde)
    const s = 70; // Saturación fija al 70%
    const l = 60; // Luminosidad fija al 60%

    return {
      color: `hsl(${h}, ${s}%, ${l}%)`
    };
  }
}
