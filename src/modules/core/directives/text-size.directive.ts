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
  selector: '[urText]',
  standalone: true,
})
export class TextSizeDirective implements OnInit, OnDestroy {
  screenSizeChanges$: Subscription;
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private viewportService: ViewportService
  ) {}

  ngOnInit() {
    this.updateTextSize();
    this.screenSizeChanges$ = this.viewportService.screenSizeChanges.subscribe(
      () => {
        this.updateTextSize();
      }
    );
  }

  private updateTextSize() {
    const textSize = this.getResponsiveTextSize();
    this.renderer.setStyle(this.el.nativeElement, 'font-size', textSize);
  }

  private getResponsiveTextSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return '1.4rem';
      case 'md':
        return '1.2rem';
      case 'xs':
      case 'sm':
      default:
        return '0.9rem';
    }
  }

  ngOnDestroy(): void {
    this.screenSizeChanges$.unsubscribe();
  }
}
