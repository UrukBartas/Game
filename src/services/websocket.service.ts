import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Subject, take } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { PlayerStateEnum } from 'src/modules/game/activities/leadeboard/enum/player-state.enum';
import { ChallengeModalComponent } from 'src/modules/game/components/challengee-modal/challenge-modal.component';
import { MainState } from 'src/store/main.store';
import { SoundService } from './sound.service';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  socket: Socket;
  private onlinePlayersSubject = new BehaviorSubject<
    { address: string; state: PlayerStateEnum }[]
  >([]);
  onlinePlayers$ = this.onlinePlayersSubject.asObservable();
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

    this.socket.on('onlinePlayers', (data) => {
      this.onlinePlayersSubject.next(data.players);
    });

    this.socket.on('challengeReceived', ({ challenger }) => {
      this.soundService.playSound('assets/sounds/battle-horn.mp3');
      const config: ModalOptions = {
        id: challenger.id,
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
