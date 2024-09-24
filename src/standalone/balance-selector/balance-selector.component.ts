import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom, Observable } from 'rxjs';

@Component({
  selector: 'app-balance-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './balance-selector.component.html',
  styleUrl: './balance-selector.component.scss',
})
export class BalanceSelectorComponent {
  @Input() type: 'in-game' | 'wallet' = 'in-game';
  @Input() player$: Observable<any>; // Observable del jugador
  @Input() erc20Balance$: Observable<any>; // Observable del balance de ERC20
  @Input() selectedUruks = 0;
  @Input() hideSummary = false;
  @Output() selectedUruksChange = new EventEmitter<number>();

  public async assignValueToSelectedUruks(factor: number) {
    const player = await firstValueFrom(this.player$);
    const erc20Balance = await firstValueFrom(this.erc20Balance$);
    this.selectedUruks =
      (this.type == 'in-game' ? player.uruks : Number(erc20Balance)) * factor;
    this.selectedUruksChange.emit(this.selectedUruks);
  }
}
