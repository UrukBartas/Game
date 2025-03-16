import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CompressNumberPipe } from 'src/modules/core/pipes/compress-number.pipe';
import { ViewportService } from 'src/services/viewport.service';

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
export class TierizedProgressBarComponent implements OnInit, AfterViewInit {
  @Input() currentValue: number = 0;
  @Input() public set tiers(value: Tier[]) {
    this._tiers = value;
    // Cuando cambian los tiers, verificamos el scroll
    setTimeout(() => this.checkScrollNeeded(), 100);
  }
  get tiers(): Tier[] {
    return this._tiers;
  }
  private _tiers: Tier[] = [];
  @Input() mode: 'default' | 'durability' = 'default';
  @Input() tooltipTemplate: TemplateRef<any>;
  public prefix = ViewportService.getPreffixImg();

  @ViewChild('progressContainer') progressContainer: ElementRef;

  // Propiedades para el scroll
  public isMobile: boolean = false;
  public showScrollButtons: boolean = false;

  // Información del progreso actual
  public progressInfo: {
    current: number;
    tierStart: number;
    tierEnd: number;
    percentage: number;
    remaining: number;
  } = {
    current: 0,
    tierStart: 0,
    tierEnd: 0,
    percentage: 0,
    remaining: 0
  };

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResize.bind(this));
      this.onResize();
    }
    this.updateProgressInfo();
  }

  ngAfterViewInit() {
    this.checkScrollNeeded();
    // Hacer scroll al tier activo
    setTimeout(() => this.scrollToActiveTier(), 200);
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize.bind(this));
    }
  }

  ngOnChanges() {
    this.updateProgressInfo();
  }

  onResize() {
    this.isMobile = window.innerWidth < 768;
    this.checkScrollNeeded();
  }

  // Actualizar la información de progreso
  updateProgressInfo() {
    const activeTier = this.getActiveTier();
    if (activeTier) {
      this.progressInfo = {
        current: this.currentValue,
        tierStart: activeTier.start,
        tierEnd: activeTier.end,
        percentage: this.getTierProgress(activeTier),
        remaining: activeTier.end - this.currentValue
      };
    }
  }

  // Comprobar si se necesita scroll
  checkScrollNeeded() {
    setTimeout(() => {
      const container = document.querySelector('.rpg-progress-bar-container');
      const bar = document.querySelector('.rpg-progress-bar-horizontal');
      if (container && bar) {
        this.showScrollButtons = bar.scrollWidth > container.clientWidth;
      }
    }, 100);
  }

  // Hacer scroll al tier activo
  scrollToActiveTier() {
    const container = document.querySelector('.rpg-progress-bar-container');
    const activeTier = this.getActiveTier();

    if (container && activeTier) {
      const tierIndex = this.tiers.indexOf(activeTier);
      const tierElements = document.querySelectorAll('.tier');

      if (tierIndex >= 0 && tierElements && tierElements.length > tierIndex) {
        const tierElement = tierElements[tierIndex] as HTMLElement;
        const containerWidth = container.clientWidth;
        const scrollPosition = tierElement.offsetLeft - (containerWidth / 2) + (tierElement.offsetWidth / 2);

        container.scrollLeft = Math.max(0, scrollPosition);
      }
    }
  }

  // Métodos para el scroll
  scrollLeft() {
    const container = document.querySelector('.rpg-progress-bar-container');
    if (container) {
      container.scrollLeft -= 150;
    }
  }

  scrollRight() {
    const container = document.querySelector('.rpg-progress-bar-container');
    if (container) {
      container.scrollLeft += 150;
    }
  }

  // Calcula el progreso dentro de un tier específico
  getTierProgress(tier: { start: number; end: number }): number {
    if (this.currentValue < tier.start) return 0;
    if (this.currentValue >= tier.end) return 100;

    const tierRange = tier.end - tier.start;
    const progressInTier = this.currentValue - tier.start;
    return (progressInTier / tierRange) * 100;
  }

  public getActiveTier() {
    return this.tiers.find(
      (e) => this.currentValue >= e.start && this.currentValue <= e.end
    );
  }

  // Determina si un tier es el primero
  isFirstTier(tier: Tier): boolean {
    return this.tiers.indexOf(tier) === 0;
  }

  // Determina si un tier es el último
  isLastTier(tier: Tier): boolean {
    return this.tiers.indexOf(tier) === this.tiers.length - 1;
  }

  // Determina si un tier está activo
  isTierActive(tier: Tier): boolean {
    return this.currentValue >= tier.start && this.currentValue <= tier.end;
  }
}
