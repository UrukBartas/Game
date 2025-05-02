import { ViewportService } from 'src/services/viewport.service';
import { AnimateSettingsModel } from './core/models/animate-callback.model';
import { ConsumableIdentifier } from './core/models/consumable.model';
import { Item, Rarity } from './core/models/items.model';
import { MiscellanyItemIdentifier } from './core/models/misc.model';
import { EmojiIdentifier, PlayerModel } from './core/models/player.model';
import { ItemTypeSC } from './game/activities/export-import-nft/enums/ItemTypesSC';
import { pvpTiers } from './game/activities/leadeboard/const/pvp-tiers';
import { questTiers } from './game/activities/leadeboard/const/quest-tiers';
import { LeaderboardType } from './game/activities/leadeboard/enum/leaderboard-type.enum';

const weeklyHardcoreRewards =
  [
    { miscs: [MiscellanyItemIdentifier.Boost_Exp_50, MiscellanyItemIdentifier.Boost_Exp_50, MiscellanyItemIdentifier.Boost_Exp_50, MiscellanyItemIdentifier.Boost_Uruks_50, MiscellanyItemIdentifier.Boost_Uruks_50, MiscellanyItemIdentifier.Boost_Uruks_50], gold: 0 },
    { miscs: [MiscellanyItemIdentifier.Boost_Exp_30, MiscellanyItemIdentifier.Boost_Exp_30, MiscellanyItemIdentifier.Boost_Uruks_30, MiscellanyItemIdentifier.Boost_Uruks_30], gold: 0 },
    { miscs: [MiscellanyItemIdentifier.Boost_Exp_10, MiscellanyItemIdentifier.Boost_Uruks_10], gold: 0 },
  ];

const monthlyHardcoreRewards = [
  { miscs: [MiscellanyItemIdentifier.Boost_Exp_100, MiscellanyItemIdentifier.Boost_Exp_100, MiscellanyItemIdentifier.Boost_Exp_100, MiscellanyItemIdentifier.Boost_Uruks_100, MiscellanyItemIdentifier.Boost_Uruks_100, MiscellanyItemIdentifier.Boost_Uruks_100], gold: 200 },
  { miscs: [MiscellanyItemIdentifier.Boost_Exp_50, MiscellanyItemIdentifier.Boost_Uruks_50], gold: 100 },
  { miscs: [MiscellanyItemIdentifier.Boost_Exp_30], gold: 100 },
]

export const rewardsByLeaderboardType = {
  [LeaderboardType.HARDCORE_PVE]: {
    weekly: weeklyHardcoreRewards,
    monthly: monthlyHardcoreRewards,
  },
  [LeaderboardType.HARDCORE_PVP]: {
    weekly: weeklyHardcoreRewards,
    monthly: monthlyHardcoreRewards,
  },
  [LeaderboardType.PVE]: {
    weekly: [
      { lootbox: MiscellanyItemIdentifier.LootboxLegendary, gold: 0 },
      { lootbox: MiscellanyItemIdentifier.LootboxEpic, gold: 0 },
      { lootbox: MiscellanyItemIdentifier.LootboxEpic, gold: 0 },
    ],
    monthly: [
      { lootbox: MiscellanyItemIdentifier.LootboxMythic, gold: 100 },
      { lootbox: MiscellanyItemIdentifier.LootboxLegendary, gold: 50 },
      { lootbox: MiscellanyItemIdentifier.LootboxLegendary, gold: 50 },
    ],
  },
  [LeaderboardType.PVP]: {
    weekly: [
      { miscs: [MiscellanyItemIdentifier.LootboxLegendary], gold: 0 },
      { miscs: [MiscellanyItemIdentifier.LootboxEpic], gold: 0 },
      { miscs: [MiscellanyItemIdentifier.LootboxEpic], gold: 0 },
    ],
    monthly: [
      { miscs: [MiscellanyItemIdentifier.LootboxMythic], gold: 100 },
      { miscs: [MiscellanyItemIdentifier.LootboxLegendary], gold: 50 },
      { miscs: [MiscellanyItemIdentifier.LootboxLegendary], gold: 50 },
    ],
  },
  [LeaderboardType.TOP_PVP]: {
    weekly: [
      {
        miscs: [MiscellanyItemIdentifier.LootboxLegendary],
        consumables: [
          ConsumableIdentifier.Bandages,
          ConsumableIdentifier.Bandages,
          ConsumableIdentifier.Bandages,
        ],
      },
      {
        miscs: [MiscellanyItemIdentifier.LootboxEpic],
        consumables: [
          ConsumableIdentifier.BigHealthPotion,
          ConsumableIdentifier.BigHealthPotion,
          ConsumableIdentifier.BigHealthPotion,
        ],
      },
      {
        miscs: [MiscellanyItemIdentifier.LootboxUncommon],
        consumables: [
          ConsumableIdentifier.SmallHealthPotion,
          ConsumableIdentifier.SmallHealthPotion,
          ConsumableIdentifier.SmallHealthPotion,
        ],
      },
    ],
    monthly: [
      {
        miscs: [
          MiscellanyItemIdentifier.LootboxLegendary,
          MiscellanyItemIdentifier.LootboxLegendary,
        ],
        consumables: [
          ConsumableIdentifier.Bandages,
          ConsumableIdentifier.Bandages,
          ConsumableIdentifier.Bandages,
          ConsumableIdentifier.BigDamagePotion,
          ConsumableIdentifier.BigDamagePotion,
          ConsumableIdentifier.BigDamagePotion,
        ],
      },
      {
        miscs: [MiscellanyItemIdentifier.LootboxEpic, MiscellanyItemIdentifier.LootboxEpic],
        consumables: [
          ConsumableIdentifier.BigHealthPotion,
          ConsumableIdentifier.BigHealthPotion,
          ConsumableIdentifier.BigHealthPotion,
          ConsumableIdentifier.BigDamagePotion,
          ConsumableIdentifier.BigDamagePotion,
        ],
      },
      {
        miscs: [MiscellanyItemIdentifier.LootboxUncommon, MiscellanyItemIdentifier.LootboxUncommon],
        consumables: [
          ConsumableIdentifier.SmallHealthPotion,
          ConsumableIdentifier.SmallHealthPotion,
          ConsumableIdentifier.SmallHealthPotion,
          ConsumableIdentifier.SmallDamagePotion,
          ConsumableIdentifier.SmallDamagePotion,
          ConsumableIdentifier.SmallDamagePotion,
        ],
      },
    ],
  }

} as any

// Método para obtener la URL de la imagen del emoji
export function getEmojiImageUrl(emojiId: EmojiIdentifier): string {
  const emojiMap = {
    [EmojiIdentifier.EMOJI_THUMBS_UP]: '👍',
    [EmojiIdentifier.EMOJI_THUMBS_DOWN]: '👎',
    [EmojiIdentifier.EMOJI_SMILE]: '😊',
    [EmojiIdentifier.EMOJI_SAD]: '😢',
    [EmojiIdentifier.EMOJI_ANGRY]: '😠',
    [EmojiIdentifier.EMOJI_FIRE]: '🔥',
    [EmojiIdentifier.EMOJI_HEART]: '💖',
    [EmojiIdentifier.EMOJI_LAUGH]: '😂',
    [EmojiIdentifier.EMOJI_CRY]: '😢',
    [EmojiIdentifier.EMOJI_SHOCKED]: '😱',
    [EmojiIdentifier.EMOJI_COOL]: '🆒',
    [EmojiIdentifier.EMOJI_THINKING]: '🤔',
    [EmojiIdentifier.EMOJI_CLAP]: '👏',
    [EmojiIdentifier.EMOJI_PRAY]: '🙏',
    [EmojiIdentifier.EMOJI_MUSCLE]: '💪',
    [EmojiIdentifier.EMOJI_PARTY]: '🎉',
    [EmojiIdentifier.EMOJI_CROWN]: '👑',
    [EmojiIdentifier.EMOJI_GHOST]: '👻',
    [EmojiIdentifier.EMOJI_SKULL]: '💀',
    [EmojiIdentifier.EMOJI_POOP]: '💩'
  };

  return emojiMap[emojiId] || '👍';
}

export const getShowItemCompare = (viewportService: ViewportService) => {
  switch (viewportService.screenWidth) {
    case 'xxl':
    case 'xl':
    case 'lg':
    case 'md':
      return true;
    case 'xs':
    case 'sm':
    default:
      return false;
  }
};

export const globalCalculatedStackRule = (item: Item) => {
  return [calculatedStackRule(item), calculatedDurabilityRule(item)].join(' ');
};

export const calculatedStackRule = (item: Item) => {
  return !!item && !!item.canBeUpgraded ? '✨' : '';
};

export const calculatedDurabilityRule = (item: Item) => {
  const percentage = getDurabilityPercentage(
    item.durability,
    item.itemData.rarity
  );
  if (percentage > 25 && percentage <= 50) {
    return '⚠️';
  } else if (percentage <= 25) {
    return '💀';
  }
  return '';
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

export function durabilityIsEnough(item: Item) {
  const maxDurability = getMaxDurability(item.itemData.rarity) || 100;
  const currentDurabilityInPercentage = (item.durability / maxDurability) * 100;
  return currentDurabilityInPercentage >= 25;
}

export const durabilitiesByRarity = {
  [Rarity.COMMON]: [0, 12.5, 25, 37.5, 50], // Rango: 0-50
  [Rarity.UNCOMMON]: [0, 18.75, 37.5, 56.25, 75], // Rango: 0-75
  [Rarity.EPIC]: [0, 25, 50, 75, 100], // Rango: 0-100
  [Rarity.LEGENDARY]: [0, 31.25, 62.5, 93.75, 125], // Rango: 0-125
  [Rarity.MYTHIC]: [0, 37.5, 75, 112.5, 150], // Rango: 0-150
};

export function getMaxDurability(rarity: Rarity) {
  return durabilitiesByRarity[rarity][durabilitiesByRarity[rarity].length - 1];
}

export function getDurabilityPercentage(durability: number, rarity: Rarity) {
  const maxDurability = getMaxDurability(rarity);
  return (durability / maxDurability) * 100;
}

export function getDurabilityTier(durability: number, rarity: Rarity): number {
  // Define los límites de cada tier en base a la rareza y las durabilidades iniciales del script

  const thresholds = durabilitiesByRarity[rarity] ?? [0, 25, 50, 75, 100];

  // Determina el tier según los límites
  for (let tier = thresholds.length - 1; tier >= 0; tier--) {
    if (durability >= thresholds[tier]) {
      return tier;
    }
  }

  return 0; // Valor por defecto si no entra en ningún rango
}

export function getPvpTier(pvpIndex: number) {
  return pvpTiers.find(
    (tier) => pvpIndex >= tier.range[0] && pvpIndex <= tier.range[1]
  );
}

export function getQuestTier(questCount: number) {
  for (let i = questTiers.length - 1; i >= 0; i--) {
    if (questCount >= questTiers[i].maxQuests) {
      return questTiers[i];
    }
  }

  return questTiers[0];
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
  const averageIRI = totalIRI / equippedItems.length;

  return isNaN(averageIRI) ? 0 : Math.round(averageIRI);
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

export function animateElement(
  element: string,
  animation: string,
  settings?: AnimateSettingsModel
) {
  const { startingDelay, callback, callbackTimeout, callbackSafeTimeout } =
    settings || {};

  setTimeout(() => {
    const animationName = `animate__${animation}`;
    const node = document.querySelector<HTMLElement>(element);

    if (!node) {
      console.warn(`Element '${element}' not found.`);
      callback?.();
      return;
    }

    let animationCompleted = false;

    node.classList.add(`animate__animated`, animationName);

    // Handle animationend event
    const animationEndPromise = new Promise<void>((resolve) => {
      const handleAnimationEnd = (event: AnimationEvent) => {
        if (event.target === node) {
          animationCompleted = true;
          node.classList.remove(`animate__animated`, animationName);
          node.removeEventListener('animationend', handleAnimationEnd);
          resolve();
        }
      };

      node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });

    // Fallback timeout promise in case animationend does not trigger
    const timeoutPromise = new Promise<void>((resolve) => {
      if (callbackSafeTimeout !== undefined) {
        setTimeout(() => {
          if (!animationCompleted) {
            node.classList.remove(`animate__animated`, animationName);
            resolve();
          }
        }, callbackSafeTimeout);
      }
    });

    Promise.race([animationEndPromise, timeoutPromise])
      .then(() => {
        if (callback) {
          if (callbackTimeout !== undefined) {
            setTimeout(() => {
              callback();
            }, callbackTimeout);
          } else {
            callback();
          }
        }
      })
      .catch((error) => {
        console.error('Error during animation:', error);
      });
  }, startingDelay ?? 0);
}

/**
 * Determina la clase CSS para el icono de una estadística
 * @param key Clave de la estadística
 * @returns Clase CSS para el icono
 */
export function getStatIconClass(key: string): string {
  if (primaryStats.includes(key)) {
    return 'primary-stat';
  } else if (percentageStats.includes(key)) {
    return 'percentage-stat';
  } else {
    return 'rarity-stat';
  }
}

/**
 * Determina la clase CSS para el valor de una estadística
 * @param key Clave de la estadística
 * @returns Clase CSS para el valor
 */
export function getStatValueClass(key: string): string {

  if (primaryStats.includes(key)) {
    return 'primary';
  } else if (percentageStats.includes(key)) {
    return 'percentage';
  } else {
    return 'secondary';
  }
}

/**
 * Determina la clase CSS para un valor numérico (positivo, negativo o neutral)
 * @param value Valor numérico o string que comienza con +, - o 0
 * @returns Clase CSS para el valor
 */
export function getValueStatusClass(value: number | string): string {
  if (typeof value === 'number') {
    if (value > 0) {
      return 'positive';
    } else if (value < 0) {
      return 'negative';
    } else {
      return 'neutral';
    }
  } else if (typeof value === 'string') {
    if (value.charAt(0) === '+') {
      return 'positive';
    } else if (value.charAt(0) === '-') {
      return 'negative';
    } else {
      return 'neutral';
    }
  }
  return 'neutral';
}

export const getStatIcon = (key: string): string => {
  const prefix = ViewportService.getPreffixImg();
  const iconMap = {
    // Primary stats
    'damage': prefix + '/assets/icons/biceps.png',
    'health': prefix + '/assets/icons/health-normal.png',
    'armor': prefix + '/assets/icons/armor-vest.png',
    'energy': prefix + '/assets/icons/embrassed-energy.png',

    // Secondary stats
    'speed': prefix + '/assets/icons/sprint.png',
    'dodge': prefix + '/assets/icons/dodging.png',
    'crit': prefix + '/assets/icons/explosion-rays.png',
    'block': prefix + '/assets/icons/shield-bounces.png',
    'accuracy': prefix + '/assets/icons/bullseye.png',
    'penetration': prefix + '/assets/icons/cracked-shield.png',

    // Percentage stats
    'per_health': prefix + '/assets/icons/health-normal.png',
    'per_damage': prefix + '/assets/icons/biceps.png',
    'per_armor': prefix + '/assets/icons/armor-vest.png',
    'per_speed': prefix + '/assets/icons/sprint.png',
    'per_energy': prefix + '/assets/icons/embrassed-energy.png',
    'per_dodge': prefix + '/assets/icons/dodging.png',
    'per_crit': prefix + '/assets/icons/explosion-rays.png',
    'per_block': prefix + '/assets/icons/shield-bounces.png',
    'per_accuracy': prefix + '/assets/icons/bullseye.png',
    'per_penetration': prefix + '/assets/icons/cracked-shield.png'
  };

  return iconMap[key] || '/assets/icons/biceps.png';
}


export const percentageStats = [
  'crit',
  'dodge',
  'block',
  'accuracy',
  'penetration',
];

export const rarityStats = [
  'per_health',
  'per_armor',
  'per_energy',
  'per_damage',
  'per_speed',
  'per_crit',
  'per_dodge',
  'per_block',
  'per_accuracy',
  'per_penetration',
]

export const primaryStats = [
  'health',
  'armor',
  'energy',
  'damage',
  'speed',
];


/**
 * Determina si una estadística debe mostrar un símbolo de porcentaje
 * @param key Clave de la estadística
 * @returns Símbolo de porcentaje o cadena vacía
 */
export function getPercentage(key: string): string {
  return [...percentageStats, ...rarityStats].includes(key) ? '%' : '';
}

/**
 * Mapeo de etiquetas de porcentaje total
 */
export const mapTotalPercentLabels = {
  per_health: 'per_health',
  per_armor: 'per_armor',
  per_energy: 'per_energy',
  per_damage: 'per_damage',
  per_speed: 'per_speed',
  per_crit: 'per_crit',
  per_dodge: 'per_dodge',
  per_block: 'per_block',
  per_accuracy: 'per_accuracy',
  per_penetration: 'per_penetration',
};
