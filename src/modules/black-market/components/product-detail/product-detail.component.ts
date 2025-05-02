import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  @Input() product: any;
  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<any>();

  currentImageIndex: number = 0;
  quantity: number = 1;
  selectedOptions: {[key: string]: any} = {};

  constructor() { }

  ngOnInit(): void {
    // Initialize default options if product is customizable
    if (this.product.options) {
      this.product.options.forEach((option: any) => {
        if (option.values && option.values.length > 0) {
          this.selectedOptions[option.type] = option.values[0];
        }
      });
    }
  }

  changeImage(index: number): void {
    this.currentImageIndex = index;
  }

  nextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.product.images.length;
  }

  prevImage(): void {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.product.images.length) % this.product.images.length;
  }

  selectOption(type: string, option: any): void {
    this.selectedOptions[type] = option;
  }

  isOptionSelected(type: string, option: any): boolean {
    return this.selectedOptions[type]?.id === option.id;
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addItemToCart(): void {
    const cartItem = {
      product: this.product,
      quantity: this.quantity,
      selectedOptions: this.product.options ? {...this.selectedOptions} : undefined
    };

    this.addToCart.emit(cartItem);
  }

  closeModal(): void {
    this.close.emit();
  }
}