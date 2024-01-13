import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
  selector: 'template-page',
  template: ``,
  styles: [],
})
export class TemplatePage implements OnInit {
  @HostBinding('class') class = 'h-100 w-100';

  constructor() {}

  setPageClass(customClass: string) {
    if (customClass) {
      this.class = customClass;
    }
  }

  ngOnInit() {}
}
