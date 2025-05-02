import { PlayerClass } from "./player.model";

export interface ClassPassiveEffect {
  id: string;
  name: string;
  description: string;
  image: string;
  probability?: number;
  damage?: number;
}

export interface ClassPassive {
  effects: ClassPassiveEffect[];
  statBoosts: Record<string, number>;
}

export type ClassPassivesRecord = Record<PlayerClass, ClassPassive>;