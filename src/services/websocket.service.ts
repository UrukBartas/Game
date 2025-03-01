import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Subject, take } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { PlayerStateEnum } from 'src/modules/game/activities/leadeboard/enum/player-state.enum';
import { ChallengeModalComponent } from 'src/modules/game/components/challenge-modal/challenge-modal.component';
import { MainState } from 'src/store/main.store';
import { SoundService } from './sound.service';

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}
@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  socket: Socket;
  private onlinePlayersSubject = new BehaviorSubject<
    { address: string; state: PlayerStateEnum }[]
  >([]);
  onlinePlayers$ = this.onlinePlayersSubject.asObservable();
  private chatMessagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public chatMessages$ = this.chatMessagesSubject.asObservable();
  private onlineChatPlayersSubject = new BehaviorSubject<number>(0);
  public onlineChatPlayers$ = this.onlineChatPlayersSubject.asObservable();
  acceptChallenge$ = new Subject<boolean>();
  declineChallenge$ = new Subject<boolean>();
  private store = inject(Store);
  private modalService = inject(BsModalService);
  private router = inject(Router);
  private soundService = inject(SoundService);
  connect(): void {
    const token = this.store.selectSnapshot(MainState.getState)?.session?.token;
    this.socket = io(environment.apiUrl, {
      transports: ['websocket'],
      auth: token
        ? {
          token,
        }
        : undefined,
    });

    this.socket.on('chatMessage', (message: ChatMessage) => {
      const currentMessages = this.chatMessagesSubject.value;
      const updatedMessages = [...currentMessages, message].slice(-100);
      this.chatMessagesSubject.next(updatedMessages);

      // Notificar solo si el mensaje no es del usuario actual
      if (message.username !== this.getCurrentUsername()) {
        this.notifyNewMessage();
      }
    });

    this.socket.on('chatHistory', (messages: ChatMessage[]) => {
      this.chatMessagesSubject.next(messages.slice(-100));
    });

    this.socket.on('chatOnlineUsers', (data: { count: number }) => {
      console.log(data)
      this.onlineChatPlayersSubject.next(data.count);
    });


    this.socket.on('onlinePlayers', (data) => {
      this.onlinePlayersSubject.next(data.players);
    });

    this.socket.on('challengeReceived', ({ challenger }) => {
      this.soundService.playSound('assets/sounds/battle-horn.mp3');
      const config: ModalOptions = {
        id: challenger.id,
        initialState: {
          opponent: challenger,
          challenger: false,
          accept: () => {
            this.acceptChallenge(challenger.id, modal);
            modal.content.challengeResult = true;
            modal.content.challengeAccepted = true;
          },
          cancel: () => {
            this.declineChallenge(challenger.id);
          },
        },
      };
      const modal = this.modalService.show(ChallengeModalComponent, config);
      modal.onHidden.pipe(take(1)).subscribe(() => {
        if (!modal.content.challengeAccepted) {
          this.declineChallenge(challenger.id);
        }
      });
    });

    this.socket.on('challengeReceivedCanceled', ({ challenger }) => {
      this.modalService.hide(challenger.id);
    });

    this.socket.on('challengeAccepted', () => {
      this.acceptChallenge$.next(true);
    });

    this.socket.on('challengeDeclined', () => {
      this.declineChallenge$.next(false);
    });
  }

  requestOnlinePlayers(): void {
    this.socket.emit('requestOnlinePlayers');
  }

  sendChallenge(challenger, challengeeAddress: string): void {
    this.socket.emit('challengePlayer', { challenger, challengeeAddress });
  }

  cancelSentChallenge(challenger, challengeeAddress: string): void {
    this.socket.emit('cancelChallengePlayer', {
      challenger,
      challengeeAddress,
    });
  }

  acceptChallenge(challengerAddress: string, modalRef: BsModalRef): void {
    this.socket.emit('acceptChallenge', { challengerAddress });
    setTimeout(() => {
      this.router.navigateByUrl('/arena/pvp');
      modalRef.hide();
    }, 2000);
  }

  declineChallenge(challengerAddress: string): void {
    this.socket.emit('declineChallenge', { challengerAddress });
  }

  disconnect() {
    this.socket.disconnect();
  }


  public sendMessage(message: string): void {
    if (!message.trim()) return;
    this.socket.emit('sendChatMessage', {
      message: message,
      timestamp: new Date()
    });
  }


  private getCurrentUsername(): string {
    return ((this.store.selectSnapshot(MainState.getState))?.player as PlayerModel)?.name || '';
  }

  private notifyNewMessage(): void {
    // Aquí puedes implementar la lógica de notificación
    // Por ejemplo, reproducir un sonido o mostrar una notificación
    const audio = new Audio('assets/sounds/chat-notification.mp3');
    audio.play().catch(err => console.log('Error playing notification sound:', err));
  }

  public joinGlobalChat(): void {
    this.socket.emit('joinGlobalChat');
  }

  public leaveGlobalChat(): void {
    this.socket.emit('leaveGlobalChat');
  }

  public getChatHistory(): void {
    this.socket.emit('getChatHistory');
  }
}
