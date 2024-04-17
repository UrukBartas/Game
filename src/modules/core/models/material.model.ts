export interface Material {
  id: number;
  playerId: string;
  quantity: number;
  materialData: MaterialData;
  materialDataId: string;
}

export interface MaterialData {
  id: string;
  image: string;
  name: string;
  description: string;
}
