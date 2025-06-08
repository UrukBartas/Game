import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import {
  BuffType,
  ClassPasives,
  DebuffType,
  EffectType,
  ItemSetPassive,
} from 'src/modules/core/models/fight-buff.model';
import { FighterStats } from 'src/modules/core/models/player-stats.model';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';

interface EffectInfo {
  name: string;
  description: string;
  icon: string;
  color: string;
  image?: string;
  ignorePercentage?: boolean;
  ignoreValue?: boolean;
}

@Component({
  selector: 'app-fighter-status',
  templateUrl: './fighter-status.component.html',
  styleUrl: './fighter-status.component.scss',
})
export class FighterStatusComponent implements OnInit {
  @Input() fighterStatus: FighterStats;

  // Enums para usar en la plantilla
  BuffType = BuffType;
  DebuffType = DebuffType;
  ItemSetPassive = ItemSetPassive;
  ClassPasives = ClassPasives;
  Infinity = Infinity;
  prefix = ViewportService.getPreffixImg();
  // Store data
  itemSetPassives: any = {};
  classPassives: any = {};

  // Mapas para información de efectos
  private buffInfo: Record<BuffType, EffectInfo> = {
    [BuffType.CHARGE]: {
      name: 'Charged',
      description: 'Next attack does 50% more damage for',
      icon: '🔥',
      color: 'text-orange',
    },
    [BuffType.FURY_POTION]: {
      name: 'Fury Potion',
      description: 'Increased damage for',
      icon: 'fa-flask',
      color: 'text-orange',
    },
    [BuffType.ENERGY_POTION]: {
      name: 'Energy Potion',
      description: 'Recover energy each turn for',
      icon: 'fa-flask',
      color: 'text-yellow',
    },
    [BuffType.ARMOR_POTION]: {
      name: 'Armor Potion',
      description: 'Increased armor for',
      icon: 'fa-flask',
      color: 'text-gray',
    },
    [BuffType.SPEED_POTION]: {
      name: 'Speed Potion',
      description: 'Increased speed for',
      icon: 'fa-flask',
      color: 'text-green',
    },
    [BuffType.PENETRATION_POTION]: {
      name: 'Penetration Potion',
      description: 'Increased penetration for',
      icon: 'fa-flask',
      color: 'text-deep-blue',
    },
    [BuffType.CRIT_POTION]: {
      name: 'Crit Potion',
      description: 'Increased critical hit chance for',
      icon: 'fa-flask',
      color: 'text-purple',
    },
    [BuffType.DODGE_POTION]: {
      name: 'Dodge Potion',
      description: 'Increased dodge chance for',
      icon: 'fa-flask',
      color: 'text-turquoise',
    },
    [BuffType.BLOCK_POTION]: {
      name: 'Block Potion',
      description: 'Increased block chance for',
      icon: 'fa-flask',
      color: 'text-sky-blue',
    },
    [BuffType.ACCURACY_POTION]: {
      name: 'Accuracy Potion',
      description: 'Increased accuracy for',
      icon: 'fa-flask',
      color: 'text-white',
    },
    [BuffType.SHIELD]: {
      name: 'Shield',
      description: 'Increased defense and damage reflection',
      icon: 'fa-shield',
      color: 'text-white',
      ignorePercentage: true,
    },
  };

  private debuffInfo: Record<DebuffType, EffectInfo> = {
    [DebuffType.POISONED]: {
      name: 'Poisoned',
      description: 'Taking poison damage each turn for',
      icon: 'fa-skull-crossbones',
      color: 'text-green',
    },
    [DebuffType.BURNING]: {
      name: 'Burning',
      description: 'Taking burn damage each turn for',
      icon: 'fa-fire',
      color: 'text-orange',
    },
    [DebuffType.BLEEDING]: {
      name: 'Bleeding',
      description: 'Taking bleed damage each turn for',
      icon: 'fa-droplet',
      color: 'text-red',
    },
    [DebuffType.WEAKENED]: {
      name: 'Weakened',
      description: 'Reduced damage for',
      icon: 'fa-hand',
      color: 'text-gray',
    },
    [DebuffType.SLOWED]: {
      name: 'Slowed',
      description: 'Reduced speed for',
      icon: 'fa-person-walking',
      color: 'text-blue',
    },
    [DebuffType.VULNERABLE]: {
      name: 'Vulnerable',
      description: 'Taking increased damage for',
      icon: 'fa-shield-halved',
      color: 'text-red',
    },
    [DebuffType.ARMOR_BROKEN]: {
      name: 'Armor Broken',
      description: 'Reduced armor for',
      icon: 'fa-shield-xmark',
      color: 'text-gray',
    },
    [DebuffType.BLINDED]: {
      name: 'Blinded',
      description: 'Reduced accuracy for',
      icon: 'fa-eye-slash',
      color: 'text-white',
    },
    [DebuffType.STUNNED]: {
      name: 'Stunned',
      description: 'Cannot act for',
      icon: 'fa-bolt',
      color: 'text-yellow',
      ignorePercentage: true,
      ignoreValue: true,
    },
    [DebuffType.CURSED]: {
      name: 'Cursed',
      description: 'Taking dark damage and reduced stats',
      icon: 'fa-skull',
      color: 'text-dark',
    },
    [DebuffType.CONFUSED]: {
      name: 'Confused',
      description: 'Actions may fail or backfire',
      icon: 'fa-question',
      color: 'text-psychic',
    },
    [DebuffType.DRAINED]: {
      name: 'Drained',
      description: 'Losing energy and reduced stats',
      icon: 'fa-battery-empty',
      color: 'text-gray',
    },
    [DebuffType.EXHAUSTED]: {
      name: 'Exhausted',
      description: 'Attacks do 50% less damage',
      icon: 'fa-face-tired',
      color: 'text-gray',
      ignoreValue: true,
    },
  };

  // Default colors for set passives if not found in store
  private setPassiveColors: Record<ItemSetPassive, string> = {
    [ItemSetPassive.DIVINE_SPIRIT]: 'text-divine',
    [ItemSetPassive.BLOOD_LUST]: 'text-blood',
    [ItemSetPassive.SERPENT_INFUSION]: 'text-serpent',
    [ItemSetPassive.MELTING_BODY]: 'text-burning',
    [ItemSetPassive.SHARP_BODY]: 'text-sharp',
    [ItemSetPassive.ILLUSIONARY_DANCE]: 'text-illusion',
    [ItemSetPassive.ABYSSAL_SURGE]: 'text-dark',
    [ItemSetPassive.RADIANT_BARRIER]: 'text-holy',
    [ItemSetPassive.FLAMING_ECHO]: 'text-fire',
    [ItemSetPassive.THUNDER_GODS_WRATH]: 'text-electric',
    [ItemSetPassive.FROZEN_GRAVE]: 'text-cold',
    [ItemSetPassive.PRIMAL_HUNGER]: 'text-nature',
    [ItemSetPassive.VENOM_BLOOM]: 'text-poison',
    [ItemSetPassive.MENTAL_COLLAPSE]: 'text-psychic',
    [ItemSetPassive.DROWNING_PULSE]: 'text-water',
  };

  constructor(private store: Store) {}

  ngOnInit() {
    // Load item set passives from store
    this.itemSetPassives = this.store.selectSnapshot(
      MainState.getItemSetPassives
    );
    const classPasives = this.store.selectSnapshot(MainState.getClassPassives);
    Object.keys(classPasives).forEach((key) => {
      classPasives[key].effects.forEach((effect) => {
        this.classPassives[effect.id] = effect;
      });
    });
  }

  /**
   * Obtiene la información de un efecto
   */
  getEffectInfo(effectType: EffectType): EffectInfo {
    if (Object.values(BuffType).includes(effectType as BuffType)) {
      return this.buffInfo[effectType as BuffType];
    } else if (Object.values(DebuffType).includes(effectType as DebuffType)) {
      return this.debuffInfo[effectType as DebuffType];
    } else if (
      Object.values(ItemSetPassive).includes(effectType as ItemSetPassive)
    ) {
      // For set passives, get info directly from store
      const passiveKey = effectType as ItemSetPassive;
      if (this.itemSetPassives[passiveKey]) {
        return {
          name: this.itemSetPassives[passiveKey].name,
          description: this.itemSetPassives[passiveKey].description,
          icon: 'fa-question', // Fallback icon if needed
          color: this.setPassiveColors[passiveKey] || 'text-white',
          image: this.itemSetPassives[passiveKey].image,
        };
      }
    } else if (
      Object.values(ClassPasives).includes(effectType as ClassPasives)
    ) {
      // Para pasivas de clase, obtener info del store
      const passiveKey = effectType as ClassPasives;
      if (this.classPassives[passiveKey]) {
        return {
          name: this.classPassives[passiveKey].name,
          description: this.classPassives[passiveKey].description,
          icon: 'fa-hat-wizard', // Icono para pasivas de clase
          color: 'class-passive',
          image: this.classPassives[passiveKey].image,
        };
      }
    }

    return {
      name: 'Unknown Effect',
      description: 'Unknown effect',
      icon: 'fa-question',
      color: 'text-white',
    };
  }

  /**
   * Comprueba si un efecto es un buff
   */
  isBuff(effectType: string): boolean {
    return (
      Object.values(BuffType).includes(effectType as BuffType) ||
      Object.values(ItemSetPassive).includes(effectType as ItemSetPassive)
    );
  }

  /**
   * Comprueba si un efecto es un debuff
   */
  isDebuff(effectType: string): boolean {
    return Object.values(DebuffType).includes(effectType as DebuffType);
  }

  /**
   * Comprueba si un efecto es una pasiva de set
   */
  isSetPassive(effectType: string): boolean {
    return Object.values(ItemSetPassive).includes(effectType as ItemSetPassive);
  }

  /**
   * Obtiene el tooltip para un efecto
   */
  getEffectTooltip(
    effectType: EffectType,
    value: number,
    turns: number
  ): string {
    const info = this.getEffectInfo(effectType);

    if (this.isSetPassive(effectType)) {
      // For set passives, use the description from the store
      if (this.itemSetPassives[effectType]) {
        return `${this.itemSetPassives[effectType].name}: ${this.itemSetPassives[effectType].description}`;
      }
      return `${info.name}: ${info.description}`;
    }

    if (this.isClassPassive(effectType)) {
      // Para pasivas de clase, usar la descripción del store
      if (this.classPassives[effectType]) {
        return `${this.classPassives[effectType].name}: ${this.classPassives[effectType].description}`;
      }
      return `${info.name}: ${info.description}`;
    }

    const foundEffect =
      this.buffInfo[effectType] || this.debuffInfo[effectType];
    let suffix = '';
    if (!foundEffect?.ignorePercentage) suffix = `%`;
    if (!!foundEffect?.ignoreValue) value = 0;

    return `${info.name}: ${info.description} ${turns} turns${value ? ` (${value}${suffix})` : ''}`;
  }

  /**
   * Checks if an effect has an image from the store
   */
  hasImage(effectType: EffectType): boolean {
    if (this.isSetPassive(effectType)) {
      return (
        this.itemSetPassives[effectType] &&
        this.itemSetPassives[effectType].image
      );
    }

    if (this.isClassPassive(effectType)) {
      return (
        this.classPassives[effectType] && this.classPassives[effectType].image
      );
    }

    return false;
  }

  /**
   * Gets the image path for a set passive
   */
  getImagePath(effectType: EffectType): string {
    if (this.isSetPassive(effectType) && this.itemSetPassives[effectType]) {
      return this.itemSetPassives[effectType].image;
    }

    if (this.isClassPassive(effectType) && this.classPassives[effectType]) {
      return this.classPassives[effectType].image;
    }

    return '';
  }

  /**
   * Verifica si un efecto es una pasiva de clase
   */
  isClassPassive(type: EffectType): boolean {
    return Object.values(ClassPasives).includes(type as ClassPasives);
  }
}
