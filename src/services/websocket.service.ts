import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { ChallengeModalComponent } from 'src/modules/game/components/challengee-modal/challenge-modal.component';
import { MainState } from 'src/store/main.store';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  socket: Socket;
  private onlinePlayersSubject = new BehaviorSubject<string[]>([]);
  onlinePlayers$ = this.onlinePlayersSubject.asObservable();
  acceptChallenge$ = new Subject<boolean>();
  declineChallenge$ = new Subject<boolean>();
  private store = inject(Store);
  private modalService = inject(BsModalService);

  connect(): void {
    const token = this.store.selectSnapshot(MainState.getState).session.token;

    this.socket = io(environment.apiUrl, {
      transports: ['websocket'],
      auth: {
        token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('onlinePlayers', (data) => {
      this.onlinePlayersSubject.next(data.players);
    });

    this.socket.on('challengeReceived', ({ challenger }) => {
      console.log('Challenge received:', challenger);
      const config: ModalOptions = {
        initialState: {
          player: challenger,
          challenger: false,
          accept: () => {
            this.acceptChallenge(challenger.id);
          },
          cancel: () => {
            this.declineChallenge(challenger.id);
          },
        },
      };
      this.modalService.show(ChallengeModalComponent, config);
    });

    this.socket.on('challengeAccepted', (data) => {
      console.log('Challenge accepted:', data);
      this.acceptChallenge$.next(true);
    });

    this.socket.on('challengeDeclined', (data) => {
      console.log('Challenge decline:', data);
      this.declineChallenge$.next(false);
    });
  }

  requestOnlinePlayers(): void {
    this.socket.emit('requestOnlinePlayers');
  }

  sendChallenge(challenger, challengeeAddress: string): void {
    this.socket.emit('challengePlayer', { challenger, challengeeAddress });
  }

  acceptChallenge(challengerAddress: string): void {
    this.socket.emit('acceptChallenge', { challengerAddress });
  }

  declineChallenge(challengerAddress: string): void {
    this.socket.emit('declineChallenge', { challengerAddress });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
