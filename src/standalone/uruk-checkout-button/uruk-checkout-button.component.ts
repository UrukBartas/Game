import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { PaymentStatus, Quote, UrukCheckoutItem } from 'src/modules/core/models/uruk-checkout.model';
import { CompressNumberPipe } from 'src/modules/core/pipes/compress-number.pipe';
import { UrukCheckoutService as UrukCheckoutContractService } from 'src/services/contracts/uruk-checkout.service';
import { GeckoTerminalService } from 'src/services/gecko-terminal.service';
import { UrukCheckoutService } from 'src/services/uruk-checkout.service';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-uruk-checkout-button',
  standalone: true,
  imports: [CommonModule, FormsModule, CompressNumberPipe],
  templateUrl: './uruk-checkout-button.component.html',
  styleUrl: './uruk-checkout-button.component.scss'
})
export class UrukCheckoutButtonComponent implements OnDestroy {
  @Input() items: UrukCheckoutItem[] = [];
  public prefix = ViewportService.getPreffixImg();
  @Output() onGamePayment = new EventEmitter<any>();

  showPopup: boolean = false;
  showDetails: boolean = false;
  paymentStatus: PaymentStatus | null = null;
  urukCheckoutContractService = inject(UrukCheckoutContractService);
  urukCheckoutService = inject(UrukCheckoutService);
  geckoTerminalService = inject(GeckoTerminalService);
  spinnerService = inject(NgxSpinnerService);
  toastr = inject(ToastrService);

  urukTokenPrice$ = this.geckoTerminalService.getTokenPriceUSD$();
  nativeTokenPrice$ = this.geckoTerminalService.getTokenPriceIOTA$();

  // Quote timer related properties
  private timerSubscription?: Subscription;
  private quoteExpirationTime?: number;
  public remainingTime$ = new BehaviorSubject<number>(0);
  public currentQuote: Quote | null = null;
  protected readonly Math = Math;

  get totalPriceBasketInUruks() {
    return this.items.reduce((acc, item) => acc + item.price, 0);
  }

  constructor() {
    this.urukCheckoutContractService.autoConnectToValidChain();
  }

  ngOnDestroy() {
    this.stopQuoteTimer();
  }

  private startQuoteTimer(expirationTime: number) {
    this.stopQuoteTimer();
    this.quoteExpirationTime = expirationTime;

    this.timerSubscription = interval(1000)
      .pipe(
        takeWhile(() => {
          const remaining = this.quoteExpirationTime! - Math.floor(Date.now() / 1000);
          return remaining > 0;
        })
      )
      .subscribe(() => {
        const remaining = this.quoteExpirationTime! - Math.floor(Date.now() / 1000);
        this.remainingTime$.next(remaining);

        if (remaining <= 0) {
          this.setPaymentStatus('Quote expired. Please try again.', 'error', 'fa-solid fa-exclamation-circle');
          this.currentQuote = null;
          setTimeout(() => {
            this.showPopup = false;
            this.paymentStatus = null;
          }, 2000);
        }
      });
  }

  private stopQuoteTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  async togglePopup(): Promise<void> {
    this.showPopup = !this.showPopup;

    if (this.showPopup) {
      try {
        const quoteItems = this.items.map(item => ({
          type: item.productType,
          quantity: 1,
          priceUruks: item.price,
          id: item.backendId.toString()
        }));

        this.currentQuote = await this.urukCheckoutService.getQuote(quoteItems).toPromise();
        this.startQuoteTimer(this.currentQuote.expiresAt);
      } catch (error) {
        this.setPaymentStatus('Failed to get quote', 'error', 'fa-solid fa-exclamation-circle');
      }
    } else {
      this.stopQuoteTimer();
      this.paymentStatus = null;
      this.currentQuote = null;
      this.showDetails = false;
    }
  }

  async payWithGameBalance(): Promise<void> {
    if (!this.currentQuote) {
      this.setPaymentStatus('No valid quote available', 'error', 'fa-solid fa-exclamation-circle');
      return;
    }

    this.onGamePayment.emit({
      quote: this.currentQuote
    });

    this.setPaymentStatus('Processing payment...', 'info', 'fa-solid fa-spinner fa-spin');
  }

  async payWithUrukToken(): Promise<void> {
    if (!this.currentQuote) {
      this.setPaymentStatus('No valid quote available', 'error', 'fa-solid fa-exclamation-circle');
      return;
    }

    try {
      this.spinnerService.show();
      this.setPaymentStatus('Processing URUK payment...', 'info', 'fa-solid fa-spinner fa-spin');

      const tx = await this.urukCheckoutContractService.createAndPayBasketWithUruks(this.currentQuote);
      await tx.wait();

      this.setPaymentStatus('Payment successful!', 'success', 'fa-solid fa-check-circle');
      setTimeout(() => this.togglePopup(), 2000);
    } catch (error: any) {
      console.error('Error in payWithUrukToken:', error);
      this.setPaymentStatus(this.getErrorMessage(error), 'error', 'fa-solid fa-exclamation-circle');
    } finally {
      this.spinnerService.hide();
    }
  }

  async payWithNativeToken(): Promise<void> {
    if (!this.currentQuote) {
      this.setPaymentStatus('No valid quote available', 'error', 'fa-solid fa-exclamation-circle');
      return;
    }

    try {
      this.spinnerService.show();
      this.setPaymentStatus('Processing native token payment...', 'info', 'fa-solid fa-spinner fa-spin');

      const tx = await this.urukCheckoutContractService.createAndPayBasketWithNative(this.currentQuote);
      await tx.wait();

      this.setPaymentStatus('Payment successful!', 'success', 'fa-solid fa-check-circle');
      setTimeout(() => this.togglePopup(), 2000);
    } catch (error: any) {
      console.error('Error in payWithNativeToken:', error);
      this.setPaymentStatus(this.getErrorMessage(error), 'error', 'fa-solid fa-exclamation-circle');
    } finally {
      this.spinnerService.hide();
    }
  }

  private setPaymentStatus(message: string, type: 'info' | 'success' | 'error', icon: string): void {
    this.paymentStatus = { message, type, icon };
  }

  private getErrorMessage(error: any): string {
    if (error?.message?.includes('user rejected')) {
      return 'Transaction was rejected';
    }
    if (error?.message?.includes('insufficient funds')) {
      return 'Insufficient funds to complete the transaction';
    }
    return 'An error occurred while processing the payment';
  }
}

