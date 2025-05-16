import { ProductType } from "../enums/UrukCheckoutProductType.mode";

export interface QuoteItem {
  type: ProductType;
  quantity: number;
  priceUruks: number;
  priceNative: number;
  id: string;
}


export interface PaymentStatus {
  message: string;
  type: 'info' | 'success' | 'error';
  icon: string;
}

export interface UrukCheckoutItem {
  productType: ProductType;
  backendId: number;
  price: number;
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
