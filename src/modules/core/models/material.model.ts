import { Rarity } from './items.model';

export interface Material {
  id: number;
  playerId: string;
  quantity: number;
  materialData: MaterialData;
  materialDataId: string;
  souldBound: boolean;
}

export interface MaterialData {
  id: string;
  image: string;
  imageLocal: string;
  name: string;
  description: string;
  rarity: Rarity;
  price?: number;
  souldBoundByDefault: boolean;
  extraData?: any;
}
