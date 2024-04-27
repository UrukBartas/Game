import { CommonModule } from '@angular/common';
import { Component, inject, input, Input } from '@angular/core';
import { Consumable, ConsumableData } from 'src/modules/core/models/consumable.model';
import { ToIpfsImageFromCidPipe } from 'src/modules/core/pipes/to-ipfs-image-from-cid.pipe';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-consumable-tooltip',
  standalone: true,
  imports: [CommonModule, ToIpfsImageFromCidPipe],
  templateUrl: './consumable-tooltip.component.html',
  styleUrl: './consumable-tooltip.component.scss',
})
export class ConsumableTooltipComponent {
  @Input() item: ConsumableData;
  @Input() external = false
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
