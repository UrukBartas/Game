export interface Consumable {
  consumableData: ConsumableData;
  consumableDataId: string;
  id: number;
  playerId: string;
  souldBound: boolean;
}

export interface ConsumableData {
  id: string;
  image: string;
  imageLocal: string;
  name: string;
  description: string;
  premium: boolean;
  consumableType: ConsumableType;
  price?: number;
  souldBoundByDefault: boolean;
}

export enum ConsumableType {
  COMBAT = 'Combat',
  MOUNT = 'Mount',
  OTHER = 'Other',
}
