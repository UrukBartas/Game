import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  Optional,
} from '@angular/core';
import { NgControl, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[validInput]',
  standalone: true,
})
export class ValidInputDirective {
  @Input('validInput') controlName: string;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Optional() private ngControl: NgControl
  ) {}

  ngAfterViewInit() {
    const control = this.ngControl.control;

    control?.statusChanges.subscribe((status: string) => {
      if (status === 'INVALID') {
        this.setErrorStatus(control.errors);
      } else {
        this.setValidStatus();
      }
    });
  }

  private setErrorStatus(errors: ValidationErrors | null) {
    this.clearErrorMessage();

    if (errors) {
      const errorEl: HTMLElement = this.renderer.createElement('div');
      this.renderer.addClass(errorEl, 'invalid-feedback');
      // implementar mas errores if need
      let errorMessage = 'Invalid input';
      if (errors['required']) {
        errorMessage = 'This field is required';
      } else if (errors['email']) {
        errorMessage = 'Please enter a valid email address';
      }
      errorEl.textContent = errorMessage;
      this.renderer.appendChild(this.el.nativeElement.parentElement, errorEl);
    }

    this.renderer.removeClass(this.el.nativeElement, 'is-valid');
    this.renderer.addClass(this.el.nativeElement, 'is-invalid');
  }

  private setValidStatus() {
    this.clearErrorMessage();
    this.renderer.removeClass(this.el.nativeElement, 'is-invalid');
    this.renderer.addClass(this.el.nativeElement, 'is-valid');
  }

  private clearErrorMessage() {
    const errorMessageElement =
      this.el.nativeElement.parentElement.querySelector('.invalid-feedback');

    if (errorMessageElement) {
      this.renderer.removeChild(
        this.el.nativeElement.parentElement,
        errorMessageElement
      );
    }
  }
}
