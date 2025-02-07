import { Component, inject, NgZone, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { take } from 'rxjs';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { PvPFightService } from 'src/services/pvp-fight.service';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-challenge-modal',
  templateUrl: './challenge-modal.component.html',
  styleUrl: './challenge-modal.component.scss',
})
export class ChallengeModalComponent implements OnInit {
  opponent: PlayerModel;
  awaiting = false;
  challenger = false;
  challengeResult = false;
  challengeAccepted = false;
  opponentConnected = false;
  playerHasHigherMMR = true;
  accept: () => void;
  acceptAuto: () => void;
  cancel: () => void;
  modalRef = inject(BsModalRef);
  pvpFightService = inject(PvPFightService);
  ngZone = inject(NgZone);
  public prefix = ViewportService.getPreffixImg();
  autobattleTimeout = null;
  private countdownInterval: any;

  ngOnInit() {
    if (this.challenger) {
      this.pvpFightService
        .checkAutoFightAvailability(this.opponent.id)
        .pipe(take(1))
        .subscribe((lastFightDate: Date) => {
          const lastFightTime = new Date(lastFightDate);
          const now = new Date();
          const timeDifference = now.getTime() - lastFightTime.getTime();
          if (timeDifference < 3600000) {
            this.startCountdown(lastFightTime);
          } else {
            this.autobattleTimeout = null;
          }
        });
    }
  }

  startCountdown(lastFightTime: Date) {
    const updateCountdown = () => {
      const now = new Date();
      const timeDifference = now.getTime() - lastFightTime.getTime();

      if (timeDifference < 3600000) {
        const remainingTime = 3600000 - timeDifference;

        const hours = Math.floor(remainingTime / 3600000)
          .toString()
          .padStart(2, '0');
        const minutes = Math.floor((remainingTime % 3600000) / 60000)
          .toString()
          .padStart(2, '0');
        const seconds = Math.floor((remainingTime % 60000) / 1000)
          .toString()
          .padStart(2, '0');

        this.ngZone.run(() => {
          this.autobattleTimeout = `${hours}:${minutes}:${seconds}`;
        });
      } else {
        this.autobattleTimeout = null;
        clearInterval(this.countdownInterval);
      }
    };

    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);
  }

  getAutobattleButtonText(): string {
    if (this.playerHasHigherMMR) {
      return 'Too low AP';
    } else if (this.autobattleTimeout) {
      return this.autobattleTimeout;
    } else {
      return 'Autobattle';
    }
  }
}
