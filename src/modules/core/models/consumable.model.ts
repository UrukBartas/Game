export interface Consumable {
  id: number;
  image: string;
  name: string;
  description: string;
  premium: boolean;
  consumableType: ConsumableType;
  price?: number;
}

export enum ConsumableType {
  COMBAT = 'Combat',
  MOUNT = 'Mount',
  OTHER = 'Other',
}
