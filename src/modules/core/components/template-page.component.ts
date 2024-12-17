import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'template-page',
  template: ``,
  styles: [],
})
export class TemplatePage {
  @HostBinding('class') class = 'h-100 w-100 d-block';

  setPageClass(customClass: string) {
    if (customClass) {
      this.class = customClass;
    }
  }
}
