import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ViewportService } from 'src/services/viewport.service';

@Directive({
  selector: '[urTitle]',
  standalone: true,
})
export class TitleSizeDirective implements OnInit, OnDestroy {
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
        return 'calc(1.325rem + 0.9vw)';
      case 'xl':
      case 'lg':
        return 'calc(1.3rem + 0.6vw)';
      case 'md':
        return 'calc(1.275rem + 0.3vw)';
      case 'xs':
      case 'sm':
      default:
        return '1.25rem';
    }
  }

  ngOnDestroy(): void {
    if (this.screenSizeChanges$) this.screenSizeChanges$.unsubscribe();
  }
}
