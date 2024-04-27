import {
  Directive,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ViewportService } from 'src/services/viewport.service';

@Directive({
  selector: '[urSubtitle]',
  standalone: true,
})
export class SubtitleSizeDirective implements OnInit, OnDestroy {
  screenSizeChanges$: Subscription;
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private viewportService: ViewportService
  ) {}

  ngOnInit() {
    this.updateTitleSize();
    this.screenSizeChanges$ = this.viewportService.screenSizeChanges.subscribe(
      () => {
        this.updateTitleSize();
      }
    );
  }

  private updateTitleSize() {
    const textSize = this.getResponsiveTitleSize();
    this.renderer.setStyle(this.el.nativeElement, 'font-size', textSize);
  }

  private getResponsiveTitleSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
        return 'calc(1.2rem + 0.9vw)';
      case 'xl':
      case 'lg':
        return 'calc(1.15rem + 0.6vw)';
      case 'md':
        return 'calc(1.1rem + 0.3vw)';
      case 'xs':
      case 'sm':
      default:
        return '1.1rem';
    }
  }

  ngOnDestroy(): void {
    this.screenSizeChanges$.unsubscribe();
  }
}
