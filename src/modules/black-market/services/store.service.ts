import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

export interface ProductOption {
  id: string;
  name: string;
  image?: string;
  priceModifier?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string[];
  images: string[];
  badge?: string;
  inStock: boolean;
  stockQuantity?: number;
  options?: {
    type: string;
    required: boolean;
    values: ProductOption[];
  }[];
  customizable?: boolean;
  metadata?: Record<string, any>;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedOptions?: Record<string, ProductOption>;
  customization?: Record<string, any>;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
  totalPrice: number;
}

export interface Order {
  id: string;
  playerId: string;
  status: string;
  totalAmount: number;
  shippingAddress?: string;
  contactEmail?: string;
  phoneNumber?: string;
  notes?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CreateOrderRequest {
  items: CartItem[];
  shippingAddress: string;
  contactEmail: string;
  phoneNumber?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService extends ApiBaseService {
  private cartSubject = new BehaviorSubject<CartItemWithProduct[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/store';
    this.loadCart();
  }

  getProducts(category?: string): Observable<Product[]> {
    const params = category ? { category } : {};
    return this.get(`/products`, undefined, undefined, params);
  }

  getProduct(productId: string): Observable<Product> {
    return this.get(`/products/${productId}`);
  }

  async loadCart(): Promise<void> {
    try {
      const cartItems = await this.get(`/cart`).toPromise();
      const cartWithProducts: CartItemWithProduct[] = [];

      if (cartItems) {
        for (const item of cartItems) {
          try {
            const product = await this.get(`/products/${item.productId}`).toPromise();
            if (product) {
              const totalPrice = this.calculateItemPrice(product, item);
              cartWithProducts.push({
                ...item,
                product,
                totalPrice
              });
            }
          } catch (error) {
            console.error(`Error loading product ${item.productId}:`, error);
          }
        }
      }

      this.cartSubject.next(cartWithProducts);
    } catch (error) {
      console.error('Error loading cart:', error);
      this.cartSubject.next([]);
    }
  }

  private calculateItemPrice(product: Product, cartItem: CartItem): number {
    let price = product.price;

    if (cartItem.selectedOptions) {
      for (const option of Object.values(cartItem.selectedOptions)) {
        if (option.priceModifier) {
          price += option.priceModifier;
        }
      }
    }

    return price * cartItem.quantity;
  }

  async addToCart(item: CartItem): Promise<void> {
    try {
      await this.post(`/cart`, item).toPromise();
      await this.loadCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItem(index: number, quantity: number): Promise<void> {
    try {
      await this.put(`/cart/${index}`, { quantity }).toPromise();
      await this.loadCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeFromCart(index: number): Promise<void> {
    try {
      await this.delete(`/cart/${index}`).toPromise();
      await this.loadCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  async clearCart(): Promise<void> {
    try {
      await this.delete(`/cart`).toPromise();
      await this.loadCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  async getCartTotal(): Promise<number> {
    try {
      const response = await this.get(`/cart/total`).toPromise();
      return response?.total || 0;
    } catch (error) {
      console.error('Error getting cart total:', error);
      return 0;
    }
  }

  async getCartQuoteItems(): Promise<{ items: any[], shippingInfo: any }> {
    try {
      const response = await this.get(`/cart/quote-items`).toPromise();
      return response || { items: [], shippingInfo: null };
    } catch (error) {
      console.error('Error getting cart quote items:', error);
      throw error;
    }
  }

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      const order = await this.post(`/orders`, orderData).toPromise();
      await this.loadCart(); // Refresh cart after order creation
      return order!;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  getOrders(): Observable<Order[]> {
    return this.get(`/orders`);
  }

  getOrder(orderId: string): Observable<Order> {
    return this.get(`/orders/${orderId}`);
  }

  getCartCount(): number {
    return this.cartSubject.value.reduce((count, item) => count + item.quantity, 0);
  }

  getCurrentCart(): CartItemWithProduct[] {
    return this.cartSubject.value;
  }
}
