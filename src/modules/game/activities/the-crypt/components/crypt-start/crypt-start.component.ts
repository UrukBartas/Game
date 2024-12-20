import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { tap } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { CryptModel } from 'src/modules/core/models/crypt.model';
import { CryptService } from 'src/services/crypt.service';
export interface CryptStats {
  maxDepth: number;
  cryptDetails: any[];
  remainingAttempts: number;
  totalCrypts: number;
}
@Component({
  selector: 'app-crypt-start',
  templateUrl: './crypt-start.component.html',
  styleUrl: './crypt-start.component.scss',
})
export class CryptStartComponent extends TemplatePage {
  @Input() crypt: CryptModel;
  @Output() startCrypt = new EventEmitter<void>();
  @Output() getMoreCryptTries = new EventEmitter<void>();
  crypService = inject(CryptService);
  lastLoadedStats!: CryptStats;
  stats$ = this.getStats();

  ngOnChanges(changes: SimpleChanges): void {
    this.stats$ = this.getStats();
  }

  private getStats() {
    return this.crypService
      .getCryptStats()
      .pipe(tap((e) => (this.lastLoadedStats = e)));
  }
}
