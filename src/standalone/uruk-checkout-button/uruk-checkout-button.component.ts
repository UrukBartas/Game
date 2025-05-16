import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { PaymentStatus, Quote, UrukCheckoutItem } from 'src/modules/core/models/uruk-checkout.model';
import { CompressNumberPipe } from 'src/modules/core/pipes/compress-number.pipe';
import { AuthService } from 'src/services/auth.service';
import { UrukCheckoutService as UrukCheckoutContractService } from 'src/services/contracts/uruk-checkout.service';
import { GeckoTerminalService } from 'src/services/gecko-terminal.service';
import { UrukCheckoutService } from 'src/services/uruk-checkout.service';
import { ViewportService } from 'src/services/viewport.service';
import { WalletService } from 'src/services/wallet.service';
import { WebSocketService } from 'src/services/websocket.service';
import { ChainSwitcherComponent } from '../chain-switcher/chain-switcher.component';

@Component({
  selector: 'app-uruk-checkout-button',
  standalone: true,
  imports: [CommonModule, FormsModule, CompressNumberPipe, ChainSwitcherComponent],
  templateUrl: './uruk-checkout-button.component.html',
  styleUrl: './uruk-checkout-button.component.scss'
})
export class UrukCheckoutButtonComponent implements OnInit, OnDestroy {
  @Input() items: UrukCheckoutItem[] = [];
  @Output() onGamePayment = new EventEmitter<void>();
  @Output() onPurchaseCompleted = new EventEmitter<void>();
  public prefix = ViewportService.getPreffixImg();

  private purchaseSubscription?: Subscription;

  showPopup: boolean = false;
  showDetails: boolean = false;
  isLoadingQuote: boolean = false;
  paymentStatus: PaymentStatus | null = null;
  urukCheckoutContractService = inject(UrukCheckoutContractService);
  urukCheckoutService = inject(UrukCheckoutService);
  geckoTerminalService = inject(GeckoTerminalService);
  spinnerService = inject(NgxSpinnerService);
  toastr = inject(ToastrService);
  authService = inject(AuthService);
  walletService = inject(WalletService);
  webSocketService = inject(WebSocketService);

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

  get isWeb2User() {
    return this.authService.loggedWithEmail();
  }

  constructor() {
    if (!this.isWeb2User) {
      this.urukCheckoutContractService.autoConnectToValidChain();
    }
  }

  ngOnInit() {
    // No necesitamos duplicar la suscripción aquí
  }

  ngOnDestroy() {
    this.stopQuoteTimer();
    if (this.purchaseSubscription) {
      this.purchaseSubscription.unsubscribe();
    }
  }

  async onNetworkChanged(chainId: number) {
    if (this.showPopup && !this.isLoadingQuote) {
      await this.refreshQuote();
    }
  }

  private async refreshQuote() {
    try {
      this.isLoadingQuote = true;
      this.currentQuote = null;
      this.stopQuoteTimer();

      const quoteItems = this.items.map(item => ({
        type: item.productType,
        quantity: 1,
        priceUruks: item.price,
        priceNative: 0,
        id: item.backendId.toString()
      }));

      this.currentQuote = await this.urukCheckoutService.getQuote(quoteItems).toPromise();
      this.startQuoteTimer(this.currentQuote.expiresAt);
    } catch (error) {
      this.setPaymentStatus('Failed to get quote', 'error', 'fa-solid fa-exclamation-circle');
    } finally {
      this.isLoadingQuote = false;
    }
  }

  private startQuoteTimer(expirationTime: number) {
    this.stopQuoteTimer();
    this.quoteExpirationTime = expirationTime;

    this.timerSubscription = interval(1000)
      .pipe(
        takeWhile(() => {
          const remaining = this.quoteExpirationTime! - Math.floor(Date.now() / 1000);
          return remaining >= 0;
        })
      )
      .subscribe(() => {
        const remaining = this.quoteExpirationTime! - Math.floor(Date.now() / 1000);
        this.remainingTime$.next(remaining);
        if (remaining <= 0) {
          this.setPaymentStatus('Quote expired. Please try again.', 'error', 'fa-solid fa-exclamation-circle');
          this.currentQuote = null;
          this.showPopup = false;
          this.stopQuoteTimer();

          setTimeout(() => {
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
      await this.refreshQuote();
    } else {
      this.stopQuoteTimer();
      this.paymentStatus = null;
      this.currentQuote = null;
      this.showDetails = false;
    }
  }

  async payWithGameBalance(): Promise<void> {
    this.onGamePayment.emit();
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

      await this.urukCheckoutContractService.createAndPayBasketWithUruks(this.currentQuote);
      this.setPaymentStatus('Payment successful!', 'success', 'fa-solid fa-check-circle');
      this.handlePurchaseCompleted()
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

      await this.urukCheckoutContractService.createAndPayBasketWithNative(this.currentQuote);
      this.setPaymentStatus('Payment successful!', 'success', 'fa-solid fa-check-circle');
      this.handlePurchaseCompleted()
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
    if (error?.message?.includes('execution reverted')) {
      const revertMessage = error.message.match(/execution reverted:(.+?)"/)?.[1]?.trim();
      return revertMessage || 'Transaction failed: Smart contract error';
    }
    return 'An error occurred while processing the payment';
  }

  private handlePurchaseCompleted(): void {
    this.stopQuoteTimer();
    this.toastr.success('Purchase completed successfully!');
    this.onPurchaseCompleted.emit();
  }
}

