import { Rarity } from './core/models/items.model';

export function getRarityColor(rarity: Rarity): string {
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
  if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error(
      'La dirección proporcionada no tiene el formato válido de una dirección de Ethereum.'
    );
  }

  const truncated =
    address.slice(0, length + 2) + '...' + address.slice(-length);
  return truncated;
}

export const round2Decimals = (value: number) => Math.round(value * 100) / 100;
