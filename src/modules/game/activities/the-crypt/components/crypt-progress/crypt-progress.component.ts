import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output
} from '@angular/core';
import { cloneDeep } from 'lodash';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { CryptEncounterModel } from 'src/modules/core/models/crypt.model';
import { Rarity } from 'src/modules/core/models/items.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { OrderByPipe } from 'src/modules/core/pipes/order-by.pipe';
import { ConfirmModalComponent } from 'src/modules/game/components/confirm-modal/confirm.modal.component';
import { getRarityColor } from 'src/modules/utils';
@Component({
  selector: 'app-crypt-progress',
  templateUrl: './crypt-progress.component.html',
  styleUrl: './crypt-progress.component.scss',
})
export class CryptProgressComponent extends TemplatePage {
  @Input() currentLevel: number = 0;
  @Input() appliedBonuses: Array<any> = [];
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
  @Input() currentState: PlayerModel;
  @Output() startedEncounter = new EventEmitter<CryptEncounterModel>();
  @Output() surrender = new EventEmitter<void>();
  public prefix = environment.permaLinkImgPref;

  private modalService = inject(BsModalService);
  sort = inject(OrderByPipe);
  getRarityColor = getRarityColor;

  getBackgroundImage() {
    let image = this.encounters.find((encounter, index) => index === this.currentLevel)?.questData.backgroundImage;
    if (!image) {
      image = '/assets/backgrounds/sewers.webp'
    }
    return this.prefix + image;
  }


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

  public triggerSurrender() {
    const config: ModalOptions = {
      initialState: {
        title: 'Are you sure you want to surrender?',
        description: `If you surrender now, all your progress in the Crypt will be lost, and you will have to start from the beginning.\n\nAre you sure you want to give up?`,
        accept: async () => {
          this.surrender.emit();
          modalRef.hide();
        },
      },
    };
    const modalRef = this.modalService.show(ConfirmModalComponent, config);
  }


}