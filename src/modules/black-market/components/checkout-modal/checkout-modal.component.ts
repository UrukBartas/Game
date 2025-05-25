import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViewportService } from 'src/services/viewport.service';
import { CartItemWithProduct, StoreService } from '../../services/store.service';

@Component({
  selector: 'app-checkout-modal',
  templateUrl: './checkout-modal.component.html',
  styleUrls: ['./checkout-modal.component.scss']
})
export class CheckoutModalComponent implements OnInit {
  @Input() cartItems: CartItemWithProduct[] = [];
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() orderCreated = new EventEmitter<any>();

  checkoutForm: FormGroup;
  totalAmount: number = 0;
  loading: boolean = false;
  currentStep: number = 1; // 1: shipping info, 2: payment
  quoteItems: any[] = [];
  shippingInfo: any = null;

  public preffix = ViewportService.getPreffixImg();
  constructor(
    private fb: FormBuilder,
    private storeService: StoreService
  ) {
    this.checkoutForm = this.fb.group({
      shippingAddress: ['', [Validators.required, Validators.minLength(10)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.calculateTotal();
    this.loadQuoteItems();
  }

  ngOnChanges(): void {
    this.calculateTotal();
    this.loadQuoteItems();
  }

  private calculateTotal(): void {
    this.totalAmount = this.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  private async loadQuoteItems(): Promise<void> {
    try {
      const quoteData = await this.storeService.getCartQuoteItems();
      this.quoteItems = quoteData.items || [];
      this.shippingInfo = quoteData.shippingInfo;
    } catch (error) {
      console.error('Error loading quote items:', error);
      this.quoteItems = [];
      this.shippingInfo = null;
    }
  }

  closeModal(): void {
    this.currentStep = 1;
    this.close.emit();
  }

  async proceedToPayment(): Promise<void> {
    if (this.checkoutForm.valid) {
      this.currentStep = 2;
      // Refresh quote items when proceeding to payment
      await this.loadQuoteItems();
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.checkoutForm.controls).forEach(key => {
        this.checkoutForm.get(key)?.markAsTouched();
      });
    }
  }

  onPaymentSuccess(): void {
    // Payment was successful, order has been processed by the blockchain
    this.orderCreated.emit({ success: true });
    this.closeModal();
  }

  onPaymentError(error: any): void {
    console.error('Payment error:', error);
    // Handle payment error - show message to user
  }

  goBackToShipping(): void {
    this.currentStep = 1;
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return 'Please enter a valid phone number';
    }
    return '';
  }
}
