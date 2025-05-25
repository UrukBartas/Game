import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { ViewportService } from 'src/services/viewport.service';
import { CartItem, CartItemWithProduct, Product, StoreService } from '../../services/store.service';

@Component({
  selector: 'app-merch',
  templateUrl: './merch.component.html',
  styleUrls: ['./merch.component.scss']
})
export class MerchComponent extends TemplatePage implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;
  activeCategory: string = 'all';
  cartItems: CartItemWithProduct[] = [];
  isCartOpen: boolean = false;
  loading: boolean = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();
  public preffix = ViewportService.getPreffixImg();

  constructor(private storeService: StoreService) {
    super();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.subscribeToCart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToCart(): void {
    this.storeService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cartItems = cart;
      });
  }

  async loadProducts(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      this.products = await this.storeService.getProducts().toPromise() || [];
      this.filteredProducts = this.products;
    } catch (error) {
      console.error('Error loading products:', error);
      this.error = 'Failed to load products. Please try again.';
    } finally {
      this.loading = false;
    }
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

  async addToCart(item: CartItem): Promise<void> {
    try {
      await this.storeService.addToCart(item);
      console.log('Item added to cart successfully');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      // You can show a toast notification here
    }
  }

  async updateCartItemQuantity(data: {index: number, quantity: number}): Promise<void> {
    try {
      await this.storeService.updateCartItem(data.index, data.quantity);
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  }

  async removeFromCart(index: number): Promise<void> {
    try {
      await this.storeService.removeFromCart(index);
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  }

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
  }

  async proceedToCheckout(): Promise<void> {
    // This will be handled by the shopping cart component
    console.log('Proceeding to checkout...');
  }

  async onCartRefresh(): Promise<void> {
    try {
      // Reload the cart from the server
      await this.storeService.loadCart();
      console.log('Cart refreshed successfully');
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  }

  getCartItemCount(): number {
    return this.storeService.getCartCount();
  }
}
