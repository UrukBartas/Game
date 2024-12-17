import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-crypt-start',
  templateUrl: './crypt-start.component.html',
  styleUrl: './crypt-start.component.scss'
})
export class CryptStartComponent {
  @Output() startCrypt = new EventEmitter<void>();
}
