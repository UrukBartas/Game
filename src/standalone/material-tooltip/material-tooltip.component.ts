import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MaterialData } from 'src/modules/core/models/material.model';
import { ToIpfsImageFromCidPipe } from 'src/modules/core/pipes/to-ipfs-image-from-cid.pipe';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-material-tooltip',
  standalone: true,
  imports: [CommonModule, ToIpfsImageFromCidPipe],
  templateUrl: './material-tooltip.component.html',
  styleUrl: './material-tooltip.component.scss',
})
export class MaterialTooltipComponent {
  @Input() item: MaterialData;

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
