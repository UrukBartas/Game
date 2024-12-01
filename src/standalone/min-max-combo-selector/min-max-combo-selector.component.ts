import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-min-max-combo-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './min-max-combo-selector.component.html',
  styleUrl: './min-max-combo-selector.component.scss',
})
export class MinMaxComboSelectorComponent {
  @Input() min = 0;
  @Input() max = 0;
  @Input() value = 0;
  @Input() summary = '';
  @Output() valueChange = new EventEmitter<number>();

  public async calculateValue(factor: number) {
    this.value = Number(this.value) * factor;
    this.valueChange.emit(this.value);
  }
}
