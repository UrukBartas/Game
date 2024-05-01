export interface Consumable {
  consumableData: ConsumableData;
  consumableDataId: string;
  id: number;
  playerId: string;
}

export interface ConsumableData {
  id: string;
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
