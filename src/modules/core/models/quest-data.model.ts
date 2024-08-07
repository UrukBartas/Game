import { Rarity } from './items.model';

export interface QuestDataModel {
  id: number;
  name: string;
  description: string;
  image: string;
  enemy: string;
  enemyImage: string;
  level: number;
  rarity: Rarity;
  phase: number;
  isAdventurePhase?: boolean;
  lost?: boolean;
  type: 'Default' | 'Passive';
  monsterType: MonsterType;
}

export enum MonsterType {
  HUMANOID = 'HUMANOID',
  BEAST = 'BEAST',
  MONSTER = 'MONSTER',
  UNDEAD = 'UNDEAD',
  DRAGON = 'DRAGON',
  DEMON = 'DEMON',
  ELEMENTAL = 'ELEMENTAL',
  MYTHIC = 'MYTHIC',
  MAGIC_BEAST = 'MAGIC_BEAST',
  CONSTRUCT = 'CONSTRUCT',
  GIANT_INSECT = 'GIANT_INSECT',
  SPIRIT = 'SPIRIT',
  ABERRATION = 'ABERRATION',
  FEY = 'FEY',
}
