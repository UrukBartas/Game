import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ViewportService } from 'src/services/viewport.service';
import { CartItem, Product, ProductOption } from '../../services/store.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnChanges {
  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<CartItem>();
  public preffix = ViewportService.getPreffixImg();
  selectedOptions: Record<string, ProductOption> = {};
  selectedImage: string = '';
  quantity: number = 1;
  finalPrice: number = 0;
  showFrontStickerChoice: boolean = false;
  showBackStickerChoice: boolean = false;
  previewSide: 'front' | 'back' = 'front';

  ngOnInit(): void {
    this.initializeProduct();
  }

  ngOnChanges(): void {
    this.initializeProduct();
  }

  private initializeProduct(): void {
    if (this.product) {
      this.selectedImage = this.product.images[0];
      this.selectedOptions = {};
      this.showFrontStickerChoice = false;
      this.showBackStickerChoice = false;
      this.previewSide = 'front';

      if (this.product.customizable) {
        this.autoSelectFreeOptions();
      }

      this.calculatePrice();
    }
  }

  hasDesignOptions(): boolean {
    return this.product?.customizable &&
           (this.hasOptionType('front_design') || this.hasOptionType('back_design'));
  }

  hasSelectableOptions(): boolean {
    return this.product?.customizable &&
           this.product.options &&
           this.product.options.length > 0;
  }

  private hasOptionType(type: string): boolean {
    return this.product?.options?.some(opt => opt.type === type) || false;
  }

  private autoSelectFreeOptions(): void {
    if (!this.product?.options) return;

    for (const optionGroup of this.product.options) {
      if (['size', 'color', 'front_design', 'back_design'].includes(optionGroup.type)) {
        const freeOption = optionGroup.values.find(option =>
          !option.priceModifier || option.priceModifier === 0
        );

        if (freeOption && optionGroup.required) {
          this.selectedOptions[optionGroup.type] = freeOption;

          if (optionGroup.type === 'front_design') {
            this.showFrontStickerChoice = this.designIncludesSticker(freeOption.id);
          }
          if (optionGroup.type === 'back_design') {
            this.showBackStickerChoice = this.designIncludesSticker(freeOption.id);
          }
        }
      }
    }

    this.updatePreviewImage();
  }

  private designIncludesSticker(designId: string): boolean {
    const stickerDesigns = [
      'custom_sticker',
      'text_and_sticker',
      'sticker_and_text'
    ];
    return stickerDesigns.includes(designId);
  }

  selectOption(optionType: string, option: ProductOption): void {
    this.selectedOptions[optionType] = option;

    if (optionType === 'front_design') {
      const needsSticker = this.designIncludesSticker(option.id);
      this.showFrontStickerChoice = needsSticker;

      if (!needsSticker && this.selectedOptions['front_sticker_choice']) {
        delete this.selectedOptions['front_sticker_choice'];
      }
    }

    if (optionType === 'back_design') {
      const needsSticker = this.designIncludesSticker(option.id);
      this.showBackStickerChoice = needsSticker;

      if (!needsSticker && this.selectedOptions['back_sticker_choice']) {
        delete this.selectedOptions['back_sticker_choice'];
      }
    }

    if (this.hasDesignOptions()) {
      this.updatePreviewImage();
    }

    this.calculatePrice();
  }

  private updatePreviewImage(): void {
    if (!this.hasDesignOptions()) return;

    if (this.previewSide === 'front') {
      const frontDesign = this.selectedOptions['front_design'];
      if (frontDesign?.image) {
        this.selectedImage = frontDesign.image;
      }
    } else {
      const backDesign = this.selectedOptions['back_design'];
      if (backDesign?.image) {
        this.selectedImage = backDesign.image;
      }
    }
  }

  switchPreviewSide(side: 'front' | 'back'): void {
    this.previewSide = side;
    this.updatePreviewImage();
  }

  private calculatePrice(): void {
    this.finalPrice = this.product?.price || 0;

    for (const option of Object.values(this.selectedOptions)) {
      if (option.priceModifier) {
        this.finalPrice += option.priceModifier;
      }
    }

    this.finalPrice *= this.quantity;
  }

  getRequiredOptions(): string[] {
    if (!this.product?.options) return [];

    return this.product.options
      .filter(opt => {
        if (opt.type === 'front_sticker_choice') {
          return this.showFrontStickerChoice;
        }
        if (opt.type === 'back_sticker_choice') {
          return this.showBackStickerChoice;
        }
        return opt.required;
      })
      .map(opt => opt.type);
  }

  canAddToCart(): boolean {
    if (!this.product?.customizable) {
      return true;
    }

    const requiredOptions = this.getRequiredOptions();
    return requiredOptions.every(optType => this.selectedOptions[optType]);
  }

  addProductToCart(): void {
    if (!this.canAddToCart() || !this.product) return;

    const cartItem: CartItem = {
      productId: this.product.id,
      quantity: this.quantity,
      selectedOptions: this.product.customizable ? { ...this.selectedOptions } : undefined
    };

    this.addToCart.emit(cartItem);
    this.close.emit();
  }

  generateMetadata(): any {
    if (!this.product) return {};

    const metadata = {
      productName: this.product.name,
      productId: this.product.id,
      quantity: this.quantity,
      basePrice: this.product.price,
      finalPrice: this.finalPrice / this.quantity, // Per unit price
      selectedOptions: this.selectedOptions,
      customizable: this.product.customizable || false,
      previewSide: this.previewSide,
      timestamp: new Date().toISOString()
    };

    return metadata;
  }

  closeModal(): void {
    this.close.emit();
  }

  updateQuantity(newQuantity: number): void {
    if (newQuantity >= 1) {
      this.quantity = newQuantity;
      this.calculatePrice();
    }
  }

  getOptionByType(type: string) {
    return this.product?.options?.find(opt => opt.type === type);
  }

  isOptionSelected(type: string, optionId: string): boolean {
    return this.selectedOptions[type]?.id === optionId;
  }
}
