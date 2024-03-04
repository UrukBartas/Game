import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViewportService {
  public screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' =
    this.getViewport();
  public screenSizeChanges: Subject<string> = new Subject();

  constructor(private zone: NgZone) {
    window.addEventListener('resize', () => {
      this.zone.run(() => {
        this.screenSize = this.getViewport();
        this.screenSizeChanges.next(this.screenSize);
      });
    });
  }

  private getViewport() {
    const width = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    if (width <= 576) return 'xs';
    if (width <= 768) return 'sm';
    if (width <= 992) return 'md';
    if (width <= 1200) return 'lg';
    if (width <= 1400) return 'xl';
    return 'xxl';
  }
}
