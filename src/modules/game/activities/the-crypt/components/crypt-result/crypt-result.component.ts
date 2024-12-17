import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-crypt-result',
  templateUrl: './crypt-result.component.html',
  styleUrl: './crypt-result.component.scss'
})
export class CryptResultComponent {
  @Input() result: { success: boolean; rewards: { type: string; value: number }[] };
  @Output() resultProcessed = new EventEmitter<void>();

  next() {
    this.resultProcessed.emit(); // Notificar que el resultado fue procesado
  }
}
