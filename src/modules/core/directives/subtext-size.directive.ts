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
  selector: '[urSubtext]',
  standalone: true,
})
export class SubtextSizeDirective implements OnInit, OnDestroy {
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
        return '1.2rem';
      case 'md':
        return '0.9rem';
      case 'xs':
      case 'sm':
      default:
        return '0.7rem';
    }
  }

  ngOnDestroy(): void {
    this.screenSizeChanges$.unsubscribe();
  }
}
