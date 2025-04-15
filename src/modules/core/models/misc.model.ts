import { Rarity } from './items.model';
import { PlayerModel } from './player.model';

export enum MiscellanyItemType {
  Lootbox = 'Lootbox',
  Recipe = 'Recipe',
  ComboLootbox = 'ComboLootbox',
  CryptLootbox = 'CryptLootbox',
  Portrait = 'Portrait',
  MoneyBag = 'MoneyBag',
  ItemSet = 'ItemSet',
  Boost = 'Boost',
  Mount = 'Mount',
  Silhouette = 'Silhouette',
  Title_Suffix = 'Title_Suffix',
  Title_Prefix = 'Title_Prefix',
}
export enum MiscellanyItemIdentifier {
  LootboxCommon = 'LootboxCommon',
  LootboxUncommon = 'LootboxUncommon',
  LootboxEpic = 'LootboxEpic',
  LootboxLegendary = 'LootboxLegendary',
  LootboxMythic = 'LootboxMythic',
  LootboxComboCommon = 'LootboxComboCommon',
  LootboxComboUncommon = 'LootboxComboUncommon',
  LootboxComboEpic = 'LootboxComboEpic',
  LootboxComboLegendary = 'LootboxComboLegendary',
  LootboxCompoMythic = 'LootboxCompoMythic',
  CommonItemPackage = 'CommonItemPackage',
  UncommonItemPackage = 'UncommonItemPackage',
  EpicItemPackage = 'EpicItemPackage',
  LegendaryItemPackage = 'LegendaryItemPackage',
  MythicItemPackage = 'MythicItemPackage',
  MoneyBag100 = 'MoneyBag100',
  MoneyBag500 = 'MoneyBag500',
  MoneyBag1000 = 'MoneyBag1000',
  RecipeEnchant = 'RecipeEnchant',
  Boost_Exp_10 = 'Boost_Exp_10',
  Boost_Exp_15 = 'Boost_Exp_15',
  Boost_Exp_30 = 'Boost_Exp_30',
  Boost_Exp_50 = 'Boost_Exp_50',
  Boost_Exp_100 = 'Boost_Exp_100',
  Boost_Exp_150 = 'Boost_Exp_150',
  Boost_Exp_200 = 'Boost_Exp_200',
  Boost_Exp_300 = 'Boost_Exp_300',
  Boost_Exp_500 = 'Boost_Exp_500',
  Boost_Uruks_10 = 'Boost_Uruks_10',
  Boost_Uruks_15 = 'Boost_Uruks_15',
  Boost_Uruks_30 = 'Boost_Uruks_30',
  Boost_Uruks_50 = 'Boost_Uruks_50',
  Boost_Uruks_100 = 'Boost_Uruks_100',
  Boost_Uruks_150 = 'Boost_Uruks_150',
  Boost_Uruks_200 = 'Boost_Uruks_200',
  Boost_Uruks_300 = 'Boost_Uruks_300',
  Boost_Uruks_500 = 'Boost_Uruks_500',

  CryptCommonLootbox = 'CryptCommonLootbox',
  CryptUncommonLootbox = 'CryptUncommonLootbox',
  CryptEpicLootbox = 'CryptEpicLootbox',
  CryptLegendaryLootbox = 'CryptLegendaryLootbox',
  CryptMythicLootbox = 'CryptMythicLootbox',

  PortraitMageBase = 'Portrait_Mage_Base',
  PortraitWarlockBase = 'Portrait_Warlock_Base',
  PortraitRogueBase = 'Portrait_Rogue_Base',
  PortraitWarriorBase = 'Portrait_Warrior_Base',
  PortraitMagePresale = 'Portrait_Mage_Presale',
  PortraitWarlockPresale = 'Portrait_Warlock_Presale',
  PortraitRoguePresale = 'Portrait_Rogue_Presale',
  PortraitWarriorPresale = 'Portrait_Warrior_Presale',
  PortraitMageUnleashed = 'Portrait_Mage_Unleashed',
  PortraitWarlockUnleashed = 'Portrait_Warlock_Unleashed',
  PortraitRogueUnleashed = 'Portrait_Rogue_Unleashed',
  PortraitWarriorUnleashed = 'Portrait_Warrior_Unleashed',
  PortraitMageWest = 'Portrait_Mage_West',
  PortraitWarlockWest = 'Portrait_Warlock_West',
  PortraitRogueWest = 'Portrait_Rogue_West',
  PortraitWarriorWest = 'Portrait_Warrior_West',
  EmberforgedElixir = 'EmberforgedElixir',
}

export const MiscellanyItemIdentifierDisplay: Record<
  MiscellanyItemIdentifier,
  string
> = {
  [MiscellanyItemIdentifier.LootboxCommon]: 'Common Lootbox',
  [MiscellanyItemIdentifier.LootboxUncommon]: 'Uncommon Lootbox',
  [MiscellanyItemIdentifier.LootboxEpic]: 'Epic Lootbox',
  [MiscellanyItemIdentifier.LootboxLegendary]: 'Legendary Lootbox',
  [MiscellanyItemIdentifier.LootboxMythic]: 'Mythic Lootbox',
  [MiscellanyItemIdentifier.LootboxComboCommon]: 'Common Combo Lootbox',
  [MiscellanyItemIdentifier.LootboxComboUncommon]: 'Uncommon Combo Lootbox',
  [MiscellanyItemIdentifier.LootboxComboEpic]: 'Epic Combo Lootbox',
  [MiscellanyItemIdentifier.LootboxComboLegendary]: 'Legendary Combo Lootbox',
  [MiscellanyItemIdentifier.LootboxCompoMythic]: 'Mythic Combo Lootbox',
  [MiscellanyItemIdentifier.CommonItemPackage]: 'Common Item Package',
  [MiscellanyItemIdentifier.UncommonItemPackage]: 'Uncommon Item Package',
  [MiscellanyItemIdentifier.EpicItemPackage]: 'Epic Item Package',
  [MiscellanyItemIdentifier.LegendaryItemPackage]: 'Legendary Item Package',
  [MiscellanyItemIdentifier.MythicItemPackage]: 'Mythic Item Package',
  [MiscellanyItemIdentifier.MoneyBag100]: 'Money Bag (100)',
  [MiscellanyItemIdentifier.MoneyBag500]: 'Money Bag (500)',
  [MiscellanyItemIdentifier.MoneyBag1000]: 'Money Bag (1000)',
  [MiscellanyItemIdentifier.RecipeEnchant]: 'Enchant Recipe',
  [MiscellanyItemIdentifier.CryptCommonLootbox]: 'Common Crypt Lootbox',
  [MiscellanyItemIdentifier.CryptUncommonLootbox]: 'Uncommon Crypt Lootbox',
  [MiscellanyItemIdentifier.CryptEpicLootbox]: 'Epic Crypt Lootbox',
  [MiscellanyItemIdentifier.CryptLegendaryLootbox]: 'Legendary Crypt Lootbox',
  [MiscellanyItemIdentifier.CryptMythicLootbox]: 'Mythic Crypt Lootbox',

  // New Portrait Identifiers
  [MiscellanyItemIdentifier.PortraitMageBase]: 'Elaris',
  [MiscellanyItemIdentifier.PortraitWarlockBase]: 'Orgok',
  [MiscellanyItemIdentifier.PortraitRogueBase]: 'Nyx',
  [MiscellanyItemIdentifier.PortraitWarriorBase]: 'Tulkas',

  [MiscellanyItemIdentifier.PortraitMagePresale]: 'Spooky Elaris',
  [MiscellanyItemIdentifier.PortraitWarlockPresale]: 'Spooky Orgok',
  [MiscellanyItemIdentifier.PortraitRoguePresale]: 'Spooky Nyx',
  [MiscellanyItemIdentifier.PortraitWarriorPresale]: 'Spooky Tulkas',

  [MiscellanyItemIdentifier.PortraitMageUnleashed]: 'Elaris Unleashed',
  [MiscellanyItemIdentifier.PortraitWarlockUnleashed]: 'Orgok Unleashed',
  [MiscellanyItemIdentifier.PortraitRogueUnleashed]: 'Nyx Unleashed',
  [MiscellanyItemIdentifier.PortraitWarriorUnleashed]: 'Tulkas Unleashed',

  [MiscellanyItemIdentifier.PortraitMageWest]: 'Elaris West',
  [MiscellanyItemIdentifier.PortraitWarlockWest]: 'Orgok West',
  [MiscellanyItemIdentifier.PortraitRogueWest]: 'Nyx West',
  [MiscellanyItemIdentifier.PortraitWarriorWest]: 'Tulkas West',
  [MiscellanyItemIdentifier.EmberforgedElixir]: 'Emberforged Elixir',

  [MiscellanyItemIdentifier.Boost_Exp_10]: 'Boost Exp 10',
  [MiscellanyItemIdentifier.Boost_Exp_15]: 'Boost Exp 15',
  [MiscellanyItemIdentifier.Boost_Exp_30]: 'Boost Exp 30',
  [MiscellanyItemIdentifier.Boost_Exp_50]: 'Boost Exp 50',
  [MiscellanyItemIdentifier.Boost_Exp_100]: 'Boost Exp 100',
  [MiscellanyItemIdentifier.Boost_Exp_150]: 'Boost Exp 150',
  [MiscellanyItemIdentifier.Boost_Exp_200]: 'Boost Exp 200',
  [MiscellanyItemIdentifier.Boost_Exp_300]: 'Boost Exp 300',
  [MiscellanyItemIdentifier.Boost_Exp_500]: 'Boost Exp 500',

  [MiscellanyItemIdentifier.Boost_Uruks_10]: 'Boost Uruks 10',
  [MiscellanyItemIdentifier.Boost_Uruks_15]: 'Boost Uruks 15',
  [MiscellanyItemIdentifier.Boost_Uruks_30]: 'Boost Uruks 30',
  [MiscellanyItemIdentifier.Boost_Uruks_50]: 'Boost Uruks 50',
  [MiscellanyItemIdentifier.Boost_Uruks_100]: 'Boost Uruks 100',
  [MiscellanyItemIdentifier.Boost_Uruks_150]: 'Boost Uruks 150',
  [MiscellanyItemIdentifier.Boost_Uruks_200]: 'Boost Uruks 200',
  [MiscellanyItemIdentifier.Boost_Uruks_300]: 'Boost Uruks 300',
  [MiscellanyItemIdentifier.Boost_Uruks_500]: 'Boost Uruks 500',



};

// Interfaces
export interface MiscellanyItem {
  id: number;
  playerId?: string | null;
  player?: PlayerModel | null;
  miscellanyItemDataId: MiscellanyItemIdentifier;
  miscellanyItemData: MiscellanyItemData;
  extraData?: any | null; // JSON type, can be anything
  souldBound: boolean;
}

export interface MiscellanyItemData {
  id: MiscellanyItemIdentifier;
  name: string;
  image: string;
  imageLocal?: string | null;
  rarity: Rarity;
  itemType: MiscellanyItemType;
  description: string;
  instances: MiscellanyItem[];
  souldBoundByDefault: boolean;
  value?: any;
  extraData?: any | null; // JSON type, can be anything
}
