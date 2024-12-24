import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CryptEncounterModel,
  CryptModel,
  EncounterStatus,
} from 'src/modules/core/models/crypt.model';
import { PlayerModel } from 'src/modules/core/models/player.model';

@Component({
  selector: 'app-crypto-failed',
  templateUrl: './crypto-failed.component.html',
  styleUrl: './crypto-failed.component.scss',
})
export class CryptoFailedComponent {
  @Input() crypt: CryptModel;
  @Input() currentLevel = 0;
  @Output() startNewCrypt = new EventEmitter<void>();
  @Input() appliedBonuses: Array<any> = [];
  @Input() currentState: PlayerModel;
  get completedEncounters(): CryptEncounterModel[] {
    return this.crypt.encounters.filter(
      (encounter) => encounter.status === EncounterStatus.COMPLETED
    );
  }

  exit() {
    this.startNewCrypt.emit();
  }
}
