import { Injectable, TemplateRef, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FocuserService {
  public focusedOpened = signal(false);
  public template = signal<TemplateRef<any>>(null);
  public context = signal<any>({});
  constructor() {}

  public open(templateRef: TemplateRef<any>, context: any = {}) {
    this.template.set(templateRef);
    this.context.set(context);
    this.focusedOpened.set(true);
  }
}
