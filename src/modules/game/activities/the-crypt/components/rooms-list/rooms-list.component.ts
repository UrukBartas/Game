import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { cloneDeep } from 'lodash';
import { CryptEncounterModel } from 'src/modules/core/models/crypt.model';
import { Rarity } from 'src/modules/core/models/items.model';
import { OrderByPipe } from 'src/modules/core/pipes/order-by.pipe';
import { getRarityColor } from 'src/modules/utils';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-rooms-list',
  templateUrl: './rooms-list.component.html',
  styleUrl: './rooms-list.component.scss',
})
export class RoomsListComponent {
  @ViewChildren('activeRoom') roomElements!: QueryList<ElementRef>;
  @ViewChild('roomsListContainer') roomsListContainer!: ElementRef;
  sort = inject(OrderByPipe);
  @Input() currentLevel: number = 0;
  public prefix = ViewportService.getPreffixImg();
  getRarityColor = getRarityColor;
  @Input() public set encounters(data: CryptEncounterModel[]) {
    const cloned = cloneDeep(
      this.sort.transform(data, 'id', 'asc')
    ) as CryptEncounterModel[];
    this._encounters = cloned.map((encounter, index) => {
      const difficultyLevel = this.getDifficultyLevelByRarity(
        index,
        encounter.questData.rarity,
        cloned
      );
      return {
        ...encounter,
        difficultyLevel,
      };
    });
  }
  public get encounters() {
    return this._encounters;
  }
  _encounters: CryptEncounterModel[];

  @Output() selectedRoom = new EventEmitter<CryptEncounterModel>();

  getDifficultyLevelByRarity(
    index: number,
    rarity: string,
    encounters: CryptEncounterModel[]
  ): number {
    // Filtrar encuentros por rareza
    const encountersByRarity = encounters.filter(
      (encounter) => encounter.questData.rarity === rarity
    );

    // Validar que la rareza tiene encuentros
    if (encountersByRarity.length === 0) {
      return 1; // Valor por defecto si no hay encuentros para la rareza
    }

    // Calcular el índice relativo dentro de la rareza
    const relativeIndex = index % encountersByRarity.length;

    // Retornar el nivel de dificultad (1 a 5)
    return Math.min(relativeIndex + 1, 5);
  }

  public getRarityBasedOnIndex(index: number) {
    if (index < 5) return Rarity.COMMON;
    if (index >= 5 && index < 10) return Rarity.UNCOMMON;
    if (index >= 10 && index < 15) return Rarity.EPIC;
    if (index >= 15 && index < 20) return Rarity.LEGENDARY;
    if (index >= 20 && index < 25) return Rarity.MYTHIC;
    return Rarity.COMMON;
  }

  ngAfterViewInit(): void {
    this.focusActiveRoom();
  }

  focusActiveRoom(): void {
    const activeRoom = this.roomElements.toArray()[this.currentLevel];
    if (activeRoom) {
      activeRoom.nativeElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center', // Centrar horizontalmente
        block: 'nearest', // Ajustar verticalmente
      });
    }
  }

  updateCurrentLevel(level: number): void {
    this.currentLevel = level;
    this.focusActiveRoom();
  }
}
