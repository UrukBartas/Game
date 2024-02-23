import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { ToIpfsImageFromCidPipe } from 'src/modules/core/pipes/to-ipfs-image-from-cid.pipe';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-consumable-tooltip',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, ToIpfsImageFromCidPipe],
  templateUrl: './consumable-tooltip.component.html',
  styleUrl: './consumable-tooltip.component.scss',
})
export class ConsumableTooltipComponent {
  @Input() item: Consumable;

  viewportService = inject(ViewportService);

  public getItemBoxSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 150;
    }
    return 200;
  }
}
