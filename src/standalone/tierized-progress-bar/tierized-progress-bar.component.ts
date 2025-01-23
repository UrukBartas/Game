import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { CompressNumberPipe } from 'src/modules/core/pipes/compress-number.pipe';
export interface Tier {
  start: number;
  end: number;
  image?: string;
  class?: Function;
}
@Component({
  selector: 'app-tierized-progress-bar',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule, CompressNumberPipe],
  templateUrl: './tierized-progress-bar.component.html',
  styleUrl: './tierized-progress-bar.component.scss',
})
export class TierizedProgressBarComponent {
  @Input() currentValue: number = 0;
  @Input() tiers: Tier[] = [];
  @Input() mode: 'default' | 'durability' = 'default';
  @Input() tooltipTemplate: TemplateRef<any>;
  public prefix = environment.permaLinkImgPref;

  // Calcula el progreso dentro de un tier específico
  getTierProgress(tier: { start: number; end: number }): number {
    if (this.currentValue < tier.start) return 0; // No hay progreso en este tier si el valor es menor al inicio del tier
    if (this.currentValue >= tier.end) return 100; // El tier está completamente lleno si el valor supera el final del tier

    // Calcular el progreso parcial dentro del tier
    const tierRange = tier.end - tier.start;
    const progressInTier = this.currentValue - tier.start;
    return (progressInTier / tierRange) * 100;
  }

  public getActiveTier() {
    return this.tiers.find(
      (e) => this.currentValue >= e.start && this.currentValue <= e.end
    );
  }
}
