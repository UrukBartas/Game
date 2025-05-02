import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent {
  @Input() cartItems: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() updateQuantity = new EventEmitter<{index: number, quantity: number}>();
  @Output() removeItem = new EventEmitter<number>();
  @Output() checkout = new EventEmitter<void>();

  constructor() { }

  getItemTotal(item: any): number {
    return item.product.price * item.quantity;
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + this.getItemTotal(item), 0);
  }

  incrementQuantity(index: number): void {
    const newQuantity = this.cartItems[index].quantity + 1;
    this.updateQuantity.emit({ index, quantity: newQuantity });
  }

  decrementQuantity(index: number): void {
    if (this.cartItems[index].quantity > 1) {
      const newQuantity = this.cartItems[index].quantity - 1;
      this.updateQuantity.emit({ index, quantity: newQuantity });
    }
  }

  removeCartItem(index: number): void {
    this.removeItem.emit(index);
  }

  closeCart(): void {
    this.close.emit();
  }

  proceedToCheckout(): void {
    this.checkout.emit();
  }

  getOptionLabel(item: any): string {
    if (!item.selectedOptions) return '';

    return Object.entries(item.selectedOptions)
      .map(([key, value]: [string, any]) => `${key}: ${value.name}`)
      .join(', ');
  }
}