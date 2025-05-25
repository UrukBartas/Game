import { ProductType } from "../enums/UrukCheckoutProductType.mode";

export interface QuoteItem {
  type: ProductType;
  quantity: number;
  priceUruks: number;
  priceNative: number;
  priceUSD?: number;
  id: string;
  metadata?: string; // JSON string with item customization details
}


export interface PaymentStatus {
  message: string;
  type: 'info' | 'success' | 'error';
  icon: string;
}

export interface UrukCheckoutItem {
  productType: ProductType;
  backendId: number;
  priceUruks: number;
  priceNative: number;
  priceUSD?: number;
  metadata?: string; // JSON string with item customization details
}

export interface Quote {
  items: QuoteItem[];
  totalPriceUruks: number;
  totalPriceNative: number;
  verificationHash: string;
  expiresAt: number;
  chainId: string;
  nativeCoinName: string;
  currentNativeCoinPrice: number;
  currentUrukPrice: number;
  feesToBePaid: number;
  imageNativeCoin: string;
}
