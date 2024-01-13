import { Component, inject } from '@angular/core';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-stats-detail',
  templateUrl: './stats-detail.component.html',
  styleUrl: './stats-detail.component.scss',
})
export class StatsDetailComponent extends TemplatePage {
  private viewportService = inject(ViewportService);
  public obtainEquippedItemBoxHeightDependingOnScreenSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 150;
    }
    return 300;
  }

  public obtainEquippedItemBoxWidthDependingOnScreenSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 100;
    }
    return 200;
  }
}
