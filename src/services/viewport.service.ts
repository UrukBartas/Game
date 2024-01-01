import { HostListener, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ViewportService {
  public screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' =
    this.getViewport();

  constructor() {
    window.addEventListener('resize', (event) => {
      this.screenSize = this.getViewport();
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
