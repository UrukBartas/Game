import { Consumable } from './consumable.model';
import { Item } from './items.model';
import { Material } from './material.model';
import { MiscellanyItem } from './misc.model';
import { PlayerModel } from './player.model';

export interface MarketListing {
  id: number;
  sellerId: string;
  seller: PlayerModel;
  itemType: MarketItemType;
  itemId?: number | null;
  consumableId?: number | null;
  materialId?: number | null;
  miscellanyId?: number | null;
  price: number;
  closedPrice?:number;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date;
  status: ListingStatus;
  bids: Bid[];
  item?: Item | null;
  consumable?: Consumable | null;
  material?: Material | null;
  miscellany?: MiscellanyItem | null;
  quantity?: number;
  tradeCloserId?: string;
  tradeCloser?: PlayerModel;
}

export interface Bid {
  id: number;
  listingId: number;
  listing: MarketListing;
  bidderId: string;
  bidder: PlayerModel;
  amount: number;
  createdAt: Date;
}

export enum MarketItemType {
  ITEM = 'ITEM',
  CONSUMABLE = 'CONSUMABLE',
  MISCELLANY = 'MISCELLANY',
  MATERIAL = 'MATERIAL',
}

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  CANCELED = 'CANCELED',
}
