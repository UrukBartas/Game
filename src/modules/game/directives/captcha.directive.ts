import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CaptchaModalComponent } from '../components/captcha-modal/captcha-modal.component';

@Directive({
  selector: '[appCaptcha]'
})
export class CaptchaDirective {
  @Input() captchaEnabled = true;
  @Input() captchaProbability = 0.10; // 30% chance to show captcha
  @Output() captchaVerified = new EventEmitter<void>();
  
  private lastVerificationTime: number = 0;
  private readonly VERIFICATION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  constructor(
    private el: ElementRef,
    private modalService: BsModalService
  ) {}

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    if (!this.captchaEnabled) {
      this.captchaVerified.emit();
      return;
    }

    const currentTime = Date.now();
    const timeSinceLastVerification = currentTime - this.lastVerificationTime;

    // If recently verified, skip captcha
    if (timeSinceLastVerification < this.VERIFICATION_TIMEOUT) {
      this.captchaVerified.emit();
      return;
    }

    // Random check based on probability
    if (Math.random() > this.captchaProbability) {
      this.captchaVerified.emit();
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const modalRef = this.modalService.show(CaptchaModalComponent);
    
    const subscription = modalRef.onHidden.subscribe(() => {
      if (modalRef.content.verified) {
        this.lastVerificationTime = Date.now();
        this.captchaVerified.emit();
      }
      subscription.unsubscribe();
    });
  }
} 