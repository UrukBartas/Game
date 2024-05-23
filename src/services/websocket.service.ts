import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { TurnActionEnum } from 'src/modules/core/models/fight.model';
import { ChallengeModalComponent } from 'src/modules/game/components/challengee-modal/challenge-modal.component';
import { MainState } from 'src/store/main.store';
import { SoundService } from './sound.service';

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
  private router = inject(Router);
  private soundService = inject(SoundService);

  connect(): void {
    const token = this.store.selectSnapshot(MainState.getState).session.token;

    this.socket = io(environment.apiUrl, {
      transports: ['websocket'],
      auth: {
        token,
      },
    });

    this.socket.on('onlinePlayers', (data) => {
      this.onlinePlayersSubject.next(data.players);
    });

    this.socket.on('challengeReceived', ({ challenger }) => {
      this.soundService.playSound('assets/sounds/battle-horn.mp3');
      const config: ModalOptions = {
        initialState: {
          player: challenger,
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

  acceptChallenge(challengerAddress: string, modalRef: BsModalRef): void {
    this.socket.emit('acceptChallenge', { challengerAddress });
    setTimeout(() => {
      this.router.navigateByUrl('/arena');
      modalRef.hide();
    }, 2000);
  }

  declineChallenge(challengerAddress: string): void {
    this.socket.emit('declineChallenge', { challengerAddress });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
