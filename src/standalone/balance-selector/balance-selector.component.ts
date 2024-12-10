import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { MinMaxComboSelectorComponent } from '../min-max-combo-selector/min-max-combo-selector.component';

@Component({
  selector: 'app-balance-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MinMaxComboSelectorComponent,
  ],
  templateUrl: './balance-selector.component.html',
  styleUrl: './balance-selector.component.scss',
})
export class BalanceSelectorComponent {
  @Input() type: 'in-game' | 'wallet' = 'in-game';
  @Input() player$: Observable<any>; // Observable del jugador
  @Input() erc20Balance$: Observable<any>; // Observable del balance de ERC20
  @Input() selectedUruks = 0;
  @Output() selectedUruksChange = new EventEmitter<number>();
}
