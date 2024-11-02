import { get } from 'lodash';
import { Rarity } from './core/models/items.model';
import { PlayerModel } from './core/models/player.model';
import { ItemTypeSC } from './game/activities/export-import-nft/enums/ItemTypesSC';
export const EXTRA_DATA_CONSTS = {
  PRESALE: {
    collection: 'presale',
  },
};

export const EXTRA_DATA_MAP = {
  'PRESALE.collection': 'Founders edition presale.',
};

export const getTranslationMapExtraData = (extraDataObject) => {
  const entries = Object.keys(EXTRA_DATA_MAP);

  for (let i = 0; i < entries.length; i++) {
    const key = entries[i];
    const found = get(extraDataObject, key); // Esto busca `extraDataObject['PRESALE']['collection']`
    if (found) return EXTRA_DATA_MAP[key];
  }
  return null;
};

function blendColors(color: string, percent: number): string {
  const f = parseInt(color.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = percent < 0 ? percent * -1 : percent;
  const R = f >> 16;
  const G = (f >> 8) & 0x00ff;
  const B = f & 0x0000ff;
  return (
    '#' +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
}

export function getRarityColor(rarity: Rarity, percent = 0): string {
  const baseColor = (() => {
    switch (rarity) {
      default:
      case Rarity.COMMON:
        return '#B0B5B3';
      case Rarity.UNCOMMON:
        return '#3D74B8';
      case Rarity.EPIC:
        return '#9D44B5';
      case Rarity.LEGENDARY:
        return '#FF7F11';
      case Rarity.MYTHIC:
        return '#F34213';
    }
  })();

  return blendColors(baseColor, percent);
}

export function getIRIFromCurrentPlayer(player: PlayerModel) {
  if (!player?.items || player.items.length == 0) return 0;
  const equippedItems = (player?.items ?? []).filter((item) => item.equipped);
  let totalIRI = 0;
  equippedItems.forEach(
    (equippedItem) => (totalIRI = totalIRI + equippedItem.item_rarity_stat)
  );
  return totalIRI / equippedItems.length;
}

export function getRarityBasedOnIRI(iri: number) {
  if (iri <= 20) {
    return Rarity.COMMON;
  } else if (iri > 20 && iri <= 40) {
    return Rarity.UNCOMMON;
  } else if (iri > 40 && iri <= 60) {
    return Rarity.EPIC;
  } else if (iri > 60 && iri <= 80) {
    return Rarity.LEGENDARY;
  } else {
    return Rarity.MYTHIC;
  }
}

export function getGenericItemItemData(item: any) {
  return (
    item?.itemData ??
    item?.miscellanyItemData ??
    item?.consumableData ??
    item?.materialData ??
    null
  );
}

export function getRarityText(rarity: Rarity): string {
  switch (rarity) {
    default:
    case Rarity.COMMON:
      return 'Common';
    case Rarity.UNCOMMON:
      return 'Uncommon';
    case Rarity.EPIC:
      return 'Epic';
    case Rarity.LEGENDARY:
      return 'Legendary';
    case Rarity.MYTHIC:
      return 'Mythic';
  }
}

export function calculateXPForLevel(level: number): number {
  const baseXP = 10; // XP required for the first level
  const multiplier = 1.05; // Exponential growth factor
  return Math.round(baseXP * Math.pow(multiplier, level - 1));
}

export function animateElement(element, animation, callback?) {
  new Promise((resolve, reject) => {
    const animationName = `animate__${animation}`;
    const node = document.querySelector(element);

    if (node) {
      node.classList.add(`animate__animated`, animationName);

      const handleAnimationEnd = (event) => {
        event.stopPropagation();
        node.classList.remove(`animate__animated`, animationName);
        resolve(callback?.());
      };

      node.addEventListener('animationend', handleAnimationEnd, { once: true });
    }
  });
}

export function truncateEthereumAddress(
  address: string,
  length: number = 6
): string {
  const truncated =
    address.slice(0, length + 2) + '...' + address.slice(-length);
  return truncated;
}

export const round2Decimals = (value: number) => Math.round(value * 100) / 100;

export const fillInventoryBasedOnPlayerSockets = (
  inventory: Array<any>,
  sockets: number
) => {
  let finalArray = Array(sockets);
  for (let i = 0; i < finalArray.length; i++) {
    finalArray[i] = inventory.length > i ? inventory[i] : null;
  }
  return finalArray;
};

export const getItemTypeSCBasedOnItem = (item: any) => {
  if (!!item.itemDataId) return ItemTypeSC.Item;
  if (!!item.consumableDataId) return ItemTypeSC.Potion;
  if (!!item.materialDataId) return ItemTypeSC.Material;
  if (!!item.miscellanyItemDataId) return ItemTypeSC.Miscellaneous;
  return ItemTypeSC.Item;
};

export const getMountTimeReductionByRarity = (rarity: Rarity) => {
  switch (rarity) {
    case Rarity.COMMON:
      return 5;
    case Rarity.UNCOMMON:
      return 10;
    case Rarity.EPIC:
      return 15;
    case Rarity.LEGENDARY:
      return 20;
    case Rarity.MYTHIC:
      return 25;
    default:
      return 0;
  }
};
