import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FightTurnModel, TurnActionEnum } from 'src/modules/core/models/fight.model';

@Component({
  selector: 'app-fight-logs-modal',
  templateUrl: './fight-logs-modal.component.html',
  styleUrl: './fight-logs-modal.component.scss',
})
export class FightLogsModalComponent {
  modalRef = inject(BsModalRef);
  fightTurns: FightTurnModel[] = [];
  player: string;
  enemy: string;
  turnActions = TurnActionEnum;
}
