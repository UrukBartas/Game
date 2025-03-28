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
  extraData?: any;
}

export enum ConsumableType {
  COMBAT = 'Combat',
  MOUNT = 'Mount',
  OTHER = 'Other',
}


export enum ConsumableIdentifier {
  SmallHealthPotion = 'SmallHealthPotion',
  HealthPotion = 'HealthPotion',
  BigHealthPotion = 'BigHealthPotion',
  Bandages = 'Bandages',
  SmallEnergyPotion = 'SmallEnergyPotion',
  EnergyPotion = 'EnergyPotion',
  BigEnergyPotion = 'BigEnergyPotion',
  SmallArmorPotion = 'SmallArmorPotion',
  ArmorPotion = 'ArmorPotion',
  BigArmorPotion = 'BigArmorPotion',
  SmallDamagePotion = 'SmallDamagePotion',
  FuryPotion = 'FuryPotion',
  BigDamagePotion = 'BigDamagePotion',
  SmallSpeedPotion = 'SmallSpeedPotion',
  SpeedPotion = 'SpeedPotion',
  BigSpeedPotion = 'BigSpeedPotion',
  SmallPenetrationPotion = 'SmallPenetrationPotion',
  PenetrationPotion = 'PenetrationPotion',
  BigPenetrationPotion = 'BigPenetrationPotion',
  SmallCritPotion = 'SmallCritPotion',
  CritPotion = 'CritPotion',
  BigCritPotion = 'BigCritPotion',
  SmallDodgePotion = 'SmallDodgePotion',
  DodgePotion = 'DodgePotion',
  BigDodgePotion = 'BigDodgePotion',
  SmallBlockPotion = 'SmallBlockPotion',
  BlockPotion = 'BlockPotion',
  BigBlockPotion = 'BigBlockPotion',
  SmallAccuracyPotion = 'SmallAccuracyPotion',
  AccuracyPotion = 'AccuracyPotion',
  BigAccuracyPotion = 'BigAccuracyPotion',
  DamagePotion = 'DamagePotion'
};