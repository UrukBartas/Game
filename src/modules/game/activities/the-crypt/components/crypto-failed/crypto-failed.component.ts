import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CryptEncounterModel,
  CryptModel,
  EncounterStatus,
} from 'src/modules/core/models/crypt.model';

@Component({
  selector: 'app-crypto-failed',
  templateUrl: './crypto-failed.component.html',
  styleUrl: './crypto-failed.component.scss',
})
export class CryptoFailedComponent {
  @Input() crypt: CryptModel;
  @Output() startNewCrypt = new EventEmitter<void>();

  get completedEncounters(): CryptEncounterModel[] {
    return this.crypt.encounters.filter(
      (encounter) => encounter.status === EncounterStatus.COMPLETED
    );
  }

  exit() {
    this.startNewCrypt.emit();
  }
}
