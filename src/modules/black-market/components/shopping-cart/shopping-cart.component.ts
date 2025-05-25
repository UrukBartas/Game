import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ViewportService } from 'src/services/viewport.service';
import { CartItemWithProduct } from '../../services/store.service';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {
  @Input() cartItems: CartItemWithProduct[] = [];
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() updateQuantity = new EventEmitter<{ index: number, quantity: number }>();
  @Output() removeItem = new EventEmitter<number>();
  @Output() checkout = new EventEmitter<void>();
  @Output() refreshCart = new EventEmitter<void>();
  public preffix = ViewportService.getPreffixImg();
  isCheckoutModalOpen: boolean = false;

  ngOnInit(): void { }

  closeCart(): void {
    this.close.emit();
  }

  onUpdateQuantity(index: number, quantity: number): void {
    this.updateQuantity.emit({ index, quantity });
  }

  onRemoveItem(index: number): void {
    this.removeItem.emit(index);
  }

  openCheckout(): void {
    this.isCheckoutModalOpen = true;
  }

  closeCheckout(): void {
    this.isCheckoutModalOpen = false;
  }

  onOrderCreated(order: any): void {
    this.closeCheckout();
    this.closeCart();
    // Emit event to refresh the cart in the parent component
    this.refreshCart.emit();
    console.log('Order created successfully:', order);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + item.totalPrice, 0);
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getSelectedOptionsText(item: CartItemWithProduct): string {
    if (!item.selectedOptions) return '';

    return Object.entries(item.selectedOptions)
      .map(([type, option]) => option.name)
      .join(', ');
  }
}
