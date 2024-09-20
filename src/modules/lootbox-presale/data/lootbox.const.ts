import { Rarity } from 'src/modules/core/models/items.model';
import { LootboxPresaleModel } from '../models/lootbox-presale.model';

export const lootboxes: LootboxPresaleModel[] = [
  {
    name: '⧫ Crate of Fortune ⧫',
    image: 'assets/presale/common-combobox.png',
    rarity: Rarity.COMMON,
    total: 150,
  },
  {
    name: '✦ Crate of Misteries ✦',
    image: 'assets/presale/uncommon-combobox.png',
    rarity: Rarity.UNCOMMON,
    total: 150,
  },
  {
    name: '★ Crate of Legends ★',
    image: 'assets/presale/epic-combobox.png',
    rarity: Rarity.EPIC,
    total: 150,
  },
  {
    name: '✶ Crate of Eternity ✶',
    image: 'assets/presale/legendary-combobox.png',
    rarity: Rarity.LEGENDARY,
    total: 150,
  },
  {
    name: '✹ Crate of Gods ✹',
    image: 'assets/presale/mythic-combobox.png',
    rarity: Rarity.MYTHIC,
    total: 150,
  },
];

export const lootboxItemDropsByRarity = {
  [Rarity.COMMON]: [
    'misc/bags/small_bag.png',
    'misc/recipes/add_recipe.webp',
    'items/boots/common/1.webp',
    'items/weapon/common/1.webp',
    'items/charm/common/2.webp',
    'items/weapon/common/3.webp',
  ],
  [Rarity.UNCOMMON]: [
    'misc/bags/medium_bag_money.png',
    'misc/recipes/shuffle_recipe.webp',
    'items/boots/uncommon/1.webp',
    'items/weapon/uncommon/2.webp',
    'items/weapon/uncommon/1.webp',
    'items/charm/uncommon/1.webp',
  ],
  [Rarity.EPIC]: [
    'misc/bags/medium_bag_money.png',
    'misc/recipes/shuffle_recipe.webp',
    'items/boots/epic/1.webp',
    'items/weapon/epic/2.webp',
    'items/charm/epic/1.webp',
    'items/weapon/epic/1.webp',
  ],
  [Rarity.LEGENDARY]: [
    'premium-portraits/1.webp',
    'misc/bags/big_bag_money.png',
    'items/boots/legendary/1.webp',
    'items/weapon/legendary/2.webp',
    'misc/recipes/upgrade_level_recipe.webp',
    'items/charm/legendary/1.webp',
    'items/weapon/legendary/1.webp',
  ],
  [Rarity.MYTHIC]: [
    'premium-portraits/5.webp',
    'misc/bags/big_bag_money.png',
    'items/boots/mythic/1.webp',
    'items/weapon/mythic/1.webp',
    'misc/recipes/total_rebirth.webp',
    'items/charm/mythic/1.webp',
    'items/weapon/mythic/2.webp',
  ],
};
