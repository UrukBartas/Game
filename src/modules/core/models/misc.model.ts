import { Rarity } from './items.model';
import { PlayerModel } from './player.model';

export enum MiscellanyItemType {
  Lootbox = 'Lootbox',
  Recipe = 'Recipe',
  ComboLootbox = 'ComboLootbox',
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
  Portrait_Orc_Warrior = 'Portrait_Orc_Warrior',
  Portrait_Orc_Female_Warrior = 'Portrait_Orc_Female_Warrior',
  Portrait_Orc_Range = 'Portrait_Orc_Range',
  Portrait_Orc_Female_Range = 'Portrait_Orc_Female_Range',
  Portrait_Orc_Sorcerer = 'Portrait_Orc_Sorcerer',
  Portrait_Orc_Female_Sorcerer = 'Portrait_Orc_Female_Sorcerer',
  Portrait_Undead_Rogue = 'Portrait_Undead_Rogue',
  Portrait_Undead_Female_Rogue = 'Portrait_Undead_Female_Rogue',
  Portrait_Undead_Wizard = 'Portrait_Undead_Wizard',
  Portrait_Undead_Female_Wizard = 'Portrait_Undead_Female_Wizard',
  Portrait_Undead_Famelic = 'Portrait_Undead_Famelic',
  Portrait_Undaed_Female_Famelic = 'Portrait_Undaed_Female_Famelic',
  Portrait_Viking_Warrior = 'Portrait_Viking_Warrior',
  Portrait_Viking_Female_Warrior = 'Portrait_Viking_Female_Warrior',
  Portrait_Viking_Range = 'Portrait_Viking_Range',
  Portrait_Viking_Female_Range = 'Portrait_Viking_Female_Range',
  Portrait_Viking_Heavy = 'Portrait_Viking_Heavy',
  Portrait_Viking_Female_Heavy = 'Portrait_Viking_Female_Heavy',
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
  [MiscellanyItemIdentifier.Portrait_Orc_Warrior]: 'Orc Warrior Portrait',
  [MiscellanyItemIdentifier.Portrait_Orc_Female_Warrior]:
    'Orc Female Warrior Portrait',
  [MiscellanyItemIdentifier.Portrait_Orc_Range]: 'Orc Range Portrait',
  [MiscellanyItemIdentifier.Portrait_Orc_Female_Range]:
    'Orc Female Range Portrait',
  [MiscellanyItemIdentifier.Portrait_Orc_Sorcerer]: 'Orc Sorcerer Portrait',
  [MiscellanyItemIdentifier.Portrait_Orc_Female_Sorcerer]:
    'Orc Female Sorcerer Portrait',
  [MiscellanyItemIdentifier.Portrait_Undead_Rogue]: 'Undead Rogue Portrait',
  [MiscellanyItemIdentifier.Portrait_Undead_Female_Rogue]:
    'Undead Female Rogue Portrait',
  [MiscellanyItemIdentifier.Portrait_Undead_Wizard]: 'Undead Wizard Portrait',
  [MiscellanyItemIdentifier.Portrait_Undead_Female_Wizard]:
    'Undead Female Wizard Portrait',
  [MiscellanyItemIdentifier.Portrait_Undead_Famelic]: 'Undead Famelic Portrait',
  [MiscellanyItemIdentifier.Portrait_Undaed_Female_Famelic]:
    'Undead Female Famelic Portrait',
  [MiscellanyItemIdentifier.Portrait_Viking_Warrior]: 'Viking Warrior Portrait',
  [MiscellanyItemIdentifier.Portrait_Viking_Female_Warrior]:
    'Viking Female Warrior Portrait',
  [MiscellanyItemIdentifier.Portrait_Viking_Range]: 'Viking Range Portrait',
  [MiscellanyItemIdentifier.Portrait_Viking_Female_Range]:
    'Viking Female Range Portrait',
  [MiscellanyItemIdentifier.Portrait_Viking_Heavy]: 'Viking Heavy Portrait',
  [MiscellanyItemIdentifier.Portrait_Viking_Female_Heavy]:
    'Viking Female Heavy Portrait',
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
}
