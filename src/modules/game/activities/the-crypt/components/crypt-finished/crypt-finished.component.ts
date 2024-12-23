import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CryptEncounterModel,
  CryptModel,
  EncounterStatus,
} from 'src/modules/core/models/crypt.model';
import { PlayerModel } from 'src/modules/core/models/player.model';

@Component({
  selector: 'app-crypt-finished',
  templateUrl: './crypt-finished.component.html',
  styleUrl: './crypt-finished.component.scss',
})
export class CryptFinishedComponent {
  @Input() crypt: CryptModel;
  @Output() startNewCrypt = new EventEmitter<void>();
  @Input() currentState: PlayerModel;
  @Input() appliedBonuses: Array<any> = [];
  get completedEncounters(): CryptEncounterModel[] {
    return this.crypt.encounters.filter(
      (encounter) => encounter.status === EncounterStatus.COMPLETED
    );
  }

  exit() {
    this.startNewCrypt.emit();
  }
}
