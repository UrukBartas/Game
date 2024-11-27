import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';
import { PlayerModel } from 'src/modules/core/models/player.model';

@Component({
  selector: 'app-challenge-modal',
  templateUrl: './challenge-modal.component.html',
  styleUrl: './challenge-modal.component.scss',
})
export class ChallengeModalComponent {
  player: PlayerModel;
  awaiting = false;
  challenger = false;
  challengeResult = false;
  challengeAccepted = false;
  opponentConnected = false;
  accept: () => void;
  acceptAuto: () => void;
  cancel: () => void;
  modalRef = inject(BsModalRef);
  public prefix = environment.permaLinkImgPref;
}
