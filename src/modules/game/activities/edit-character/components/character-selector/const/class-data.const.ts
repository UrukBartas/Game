import { Rarity } from 'src/modules/core/models/items.model';
import {
  MiscellanyItemData,
  MiscellanyItemIdentifier,
  MiscellanyItemType,
} from 'src/modules/core/models/misc.model';
import { PlayerClass } from 'src/modules/core/models/player.model';

export const classData = [
  {
    clazz: PlayerClass.WARLOCK,
    race: 'Orc',
    img: '/assets/free-portraits/warlock.webp',
    icon: '/assets/free-portraits/logo/warlock.webp',
    name: 'Orgok, the Bloody-Eyed',
    description: `Once a fierce and loyal warrior of his tribe, Orgok made a fateful pact with a dark entity in exchange for the power to save his people from destruction. Now, bound to the will of a malevolent demon lord, he wields dark magic with terrifying force. Though his people view him as a savior, Orgok wrestles daily with the growing corruption of his soul reflected in his bloody eyes, knowing that one day, the price of his power will come due.`,
  },
  {
    clazz: PlayerClass.ROGUE,
    race: 'Human',
    img: '/assets/free-portraits/rogue.webp',
    icon: '/assets/free-portraits/logo/rogue.webp',
    name: 'Nyx, the Stray',
    description: `Nyx was once an unwilling child prisoner of a dark cult that exploited orphans, forcing them to worship an ancient evil. Trained in stealth and manipulation to serve the cult's sinister purposes, she ultimately rebelled and escaped their clutches. Now haunted by the memories of those left behind, Nyx works as a rogue-for-hire, using her skills to unravel the cult's hidden operations from the shadows. She walks a thin line between justice and vengeance, determined to destroy the evil that still seeks to reclaim her.`,
  },
  {
    clazz: PlayerClass.MAGE,
    race: 'Elve',
    img: '/assets/free-portraits/mage.webp',
    icon: '/assets/free-portraits/logo/mage.webp',
    name: 'Elaris, the Starweeper',
    description: `Elaris is a scholar of the arcane, born into an ancient lineage of elves who have long guarded the secrets of elemental magic. With his silver hair and piercing violet eyes, Elaris commands the forces of fire, water, and wind with ease. His quest is to unravel a mysterious prophecy that foretells the return of a cataclysmic event that once nearly wiped out the elven race. Driven by knowledge and a deep sense of duty, he ventures far from his homeland, seeking wisdom to prevent the disaster from coming to pass again.`,
  },
  {
    clazz: PlayerClass.WARRIOR,
    race: 'Dwarf',
    img: '/assets/free-portraits/warrior.webp',
    icon: '/assets/free-portraits/logo/warrior.webp',
    name: 'Tulkas, the Battleborn',
    description: `Tulkas hails from the mountain kingdom of Karak Grim, where the dwarves live and die by the blade. A seasoned warrior, Tulkas has seen countless battles, wielding his massive warhammer, "Stonebreaker," with unyielding strength. Known for his stubborn loyalty and fierce protectiveness of his kin, he fights not only for glory but to reclaim the lost relics of his ancestors, which were plundered by ancient foes long ago.`,
  },
];

export const baseSkins: MiscellanyItemData[] = [
  {
    id: MiscellanyItemIdentifier.PortraitWarlockBase,
    name: 'Orgok',
    image: '/assets/free-portraits/portraits/orc-warrior.webp',
    imageLocal: '/assets/free-portraits/warlock.webp',
    rarity: Rarity.COMMON,
    itemType: MiscellanyItemType.Portrait,
    description: `The old basic Orgok`,
    souldBoundByDefault: false,
    instances: [],
    extraData: { clazz: PlayerClass.WARLOCK },
  },
  {
    id: MiscellanyItemIdentifier.PortraitMageBase,
    name: 'Elaris',
    image: '/assets/free-portraits/portraits/mage-basic.webp',
    imageLocal: '/assets/free-portraits/mage.webp',
    rarity: Rarity.COMMON,
    itemType: MiscellanyItemType.Portrait,
    description: `The classic and wise Elaris, in his simplest form.`,
    souldBoundByDefault: false,
    instances: [],
    extraData: { clazz: PlayerClass.MAGE },
  },
  {
    id: MiscellanyItemIdentifier.PortraitRogueBase,
    name: 'Nyx',
    image: '/assets/free-portraits/portraits/rogue-basic.webp',
    imageLocal: '/assets/free-portraits/rogue.webp',
    rarity: Rarity.COMMON,
    itemType: MiscellanyItemType.Portrait,
    description: `The sneaky and agile Nyx, as unassuming as ever.`,
    souldBoundByDefault: false,
    instances: [],
    extraData: { clazz: PlayerClass.ROGUE },
  },
  {
    id: MiscellanyItemIdentifier.PortraitWarriorBase,
    name: 'Tulkas',
    image: '/assets/free-portraits/portraits/dwarf-warrior.webp',
    imageLocal: '/assets/free-portraits/warrior.webp',
    rarity: Rarity.COMMON,
    itemType: MiscellanyItemType.Portrait,
    description: `The sturdy and determined Tulkas, in his basic glory.`,
    souldBoundByDefault: false,
    instances: [],
    extraData: { clazz: PlayerClass.WARRIOR },
  },
];
