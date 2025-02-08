import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ViewportService {
  public static currentStaticSize = 'xs';
  public screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' =
    ViewportService.getViewport();
  public screenWidth: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' =
    this.getViewportWidth();
  public screenHeight: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' =
    this.getViewportHeight();
  public screenSizeChanges: Subject<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'> =
    new BehaviorSubject(ViewportService.getViewport());

  constructor(private zone: NgZone) {
    window.addEventListener('resize', () => {
      this.zone.run(() => {
        this.screenSize = ViewportService.getViewport();
        this.screenWidth = this.getViewportWidth();
        this.screenHeight = this.getViewportHeight();
        this.screenSizeChanges.next(this.screenSize);
      });
    });
  }

  static getPreffixImg() {
    const currentSize = ViewportService.getViewport();
    let res = environment.permaLinkImgPrefMobile;
    switch (currentSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        res = environment.permaLinkImgPref;
    }
    return res;
  }

  private static getViewport() {
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

  public getViewportWidth() {
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

  public getViewportHeight() {
    const width = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );
    if (width <= 576) return 'xs';
    if (width <= 768) return 'sm';
    if (width <= 992) return 'md';
    if (width <= 1200) return 'lg';
    if (width <= 1400) return 'xl';
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
