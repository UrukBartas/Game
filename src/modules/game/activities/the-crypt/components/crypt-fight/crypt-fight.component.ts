import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-crypt-fight',
  templateUrl: './crypt-fight.component.html',
  styleUrl: './crypt-fight.component.scss',
})
export class CryptFightComponent {
  @Output() fightResolved = new EventEmitter<any>();

  resolveFight() {
    // Simula un resultado del combate
    this.fightResolved.emit({ success: true, rewards: { health: 10 } });
  }
}
