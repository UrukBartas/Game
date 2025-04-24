import { Component, OnInit } from '@angular/core';

interface ProductOption {
  id: string;
  name: string;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string[];
  images: string[];
  badge?: string;
  options?: {
    type: string;
    values: ProductOption[];
  }[];
  customizable?: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: {[key: string]: ProductOption};
}

@Component({
  selector: 'app-merch',
  templateUrl: './merch.component.html',
  styleUrls: ['./merch.component.scss']
})
export class MerchComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;
  activeCategory: string = 'all';
  cartItems: CartItem[] = [];
  isCartOpen: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.loadProducts();
    this.filteredProducts = this.products;
  }

  loadProducts(): void {
    // Mock product data
    this.products = [
      {
        id: 't-shirt-1',
        name: 'Uruk Bartas Logo T-Shirt',
        price: 29.99,
        description: 'Premium cotton t-shirt featuring the iconic Uruk Bartas logo. This comfortable, stylish shirt is perfect for showing your allegiance to the realm.',
        category: ['apparel', 'featured'],
        images: [
          'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/tshirt-1.webp',
          'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/tshirt-1-back.webp',
          'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/tshirt-1-detail.webp'
        ],
        badge: 'New',
        customizable: true,
        options: [
          {
            type: 'size',
            values: [
              { id: 's', name: 'Small' },
              { id: 'm', name: 'Medium' },
              { id: 'l', name: 'Large' },
              { id: 'xl', name: 'X-Large' }
            ]
          },
          {
            type: 'color',
            values: [
              { id: 'black', name: 'Black' },
              { id: 'navy', name: 'Navy Blue' },
              { id: 'gray', name: 'Dark Gray' }
            ]
          },
          {
            type: 'design',
            values: [
              {
                id: 'logo-gold',
                name: 'Gold Logo',
                image: 'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/design-1.webp'
              },
              {
                id: 'logo-silver',
                name: 'Silver Logo',
                image: 'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/design-2.webp'
              },
              {
                id: 'warrior',
                name: 'Warrior Emblem',
                image: 'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/design-3.webp'
              }
            ]
          }
        ]
      },
      {
        id: 'hoodie-1',
        name: 'Uruk Bartas Premium Hoodie',
        price: 49.99,
        description: 'Stay warm in style with this premium hoodie featuring custom Uruk Bartas artwork. Made from high-quality materials for comfort and durability.',
        category: ['apparel'],
        images: [
          'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/hoodie-1.webp',
          'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/hoodie-1-back.webp',
          'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/hoodie-1-detail.webp'
        ],
        customizable: true,
        options: [
          {
            type: 'size',
            values: [
              { id: 's', name: 'Small' },
              { id: 'm', name: 'Medium' },
              { id: 'l', name: 'Large' },
              { id: 'xl', name: 'X-Large' }
            ]
          },
          {
            type: 'color',
            values: [
              { id: 'black', name: 'Black' },
              { id: 'navy', name: 'Navy Blue' }
            ]
          },
          {
            type: 'design',
            values: [
              {
                id: 'emblem-gold',
                name: 'Gold Emblem',
                image: 'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/design-4.webp'
              },
              {
                id: 'dragon',
                name: 'Dragon Crest',
                image: 'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/design-5.webp'
              }
            ]
          }
        ]
      },
      {
        id: 'sticker-pack-1',
        name: 'Uruk Bartas Sticker Pack',
        price: 12.99,
        description: 'A collection of 5 high-quality vinyl stickers featuring various Uruk Bartas emblems and artwork. Perfect for decorating your laptop, water bottle, or gaming setup.',
        category: ['stickers'],
        images: [
          'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/sticker-pack-1.webp',
          'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/sticker-pack-1-detail.webp'
        ]
      },
      {
        id: 'sticker-1',
        name: 'Gold Emblem Sticker',
        price: 3.99,
        description: 'Premium vinyl sticker featuring the gold Uruk Bartas emblem. Weather-resistant and durable.',
        category: ['stickers'],
        images: [
          'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/sticker-1.webp'
        ]
      },
      {
        id: 'cap-1',
        name: 'Uruk Bartas Embroidered Cap',
        price: 24.99,
        description: 'Adjustable cap with embroidered Uruk Bartas logo. One size fits most.',
        category: ['accessories', 'apparel'],
        images: [
          'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/cap-1.webp',
          'https://raw.githubusercontent.com/UrukBartas/assets/refs/heads/main/assets/black-market/products/cap-1-side.webp'
        ],
        options: [
          {
            type: 'color',
            values: [
              { id: 'black', name: 'Black' },
              { id: 'navy', name: 'Navy Blue' }
            ]
          }
        ]
      }
    ];
  }

  setCategory(category: string): void {
    this.activeCategory = category;

    if (category === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.category.includes(category)
      );
    }
  }

  openProductDetail(product: Product): void {
    this.selectedProduct = product;
  }

  closeProductDetail(): void {
    this.selectedProduct = null;
  }

  addToCart(item: CartItem): void {
    // Check if the same product with same options already exists
    const existingItemIndex = this.cartItems.findIndex(cartItem => {
      if (cartItem.product.id !== item.product.id) return false;

      // If no options, just check product ID
      if (!item.selectedOptions) return true;

      // Check if all options match
      for (const key in item.selectedOptions) {
        if (!cartItem.selectedOptions ||
            cartItem.selectedOptions[key]?.id !== item.selectedOptions[key]?.id) {
          return false;
        }
      }

      return true;
    });

    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      this.cartItems[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      this.cartItems.push(item);
    }

    // Show confirmation
    this.closeProductDetail();
    // Optional: Show a toast or notification
  }

  updateCartItemQuantity(data: {index: number, quantity: number}): void {
    if (data.index >= 0 && data.index < this.cartItems.length) {
      this.cartItems[data.index].quantity = data.quantity;
    }
  }

  removeFromCart(index: number): void {
    if (index >= 0 && index < this.cartItems.length) {
      this.cartItems.splice(index, 1);
    }
  }

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
  }

  proceedToCheckout(): void {
    // Implement checkout logic
    console.log('Proceeding to checkout with items:', this.cartItems);
    // This would typically navigate to a checkout page or open a checkout modal
  }
}
