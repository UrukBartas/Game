import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
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
  accept: () => void;
  cancel: () => void;
  modalRef = inject(BsModalRef);
}
