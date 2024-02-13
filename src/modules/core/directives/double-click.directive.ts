import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appDoubleClick]',
  standalone: true,
})
export class DoubleClickDirective {
  @Output() appDoubleClick = new EventEmitter();

  private clicks = 0;
  private readonly DOUBLE_CLICK_THRESHOLD = 250; // Threshold in milliseconds

  constructor() {}

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    this.clicks++;
    if (this.clicks === 1) {
      setTimeout(() => {
        if (this.clicks === 1) {
          // Single click
        } else {
          // Double click
          this.appDoubleClick.emit(event);
        }
        this.clicks = 0;
      }, this.DOUBLE_CLICK_THRESHOLD);
    }
  }
}
