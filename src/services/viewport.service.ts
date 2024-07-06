import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViewportService {
  public screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' =
    this.getViewport();
  public screenSizeChanges: Subject<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'> =
    new Subject();

  constructor(private zone: NgZone) {
    window.addEventListener('resize', () => {
      this.zone.run(() => {
        this.screenSize = this.getViewport();
        this.screenSizeChanges.next(this.screenSize);
      });
    });
  }

  private getViewport() {
    const vmax = Math.max(
      Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
      Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    );

    if (vmax <= 576) return 'xs';
    if (vmax <= 768) return 'sm';
    if (vmax <= 992) return 'md';
    if (vmax <= 1200) return 'lg';
    if (vmax <= 1400) return 'xl';
    return 'xxl';
  }

  getResponsiveSizeChestImg() {
    switch (this.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
      case 'md':
        return [200, 180];
      default:
        return [100, 90];
    }
  }
}
