import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ClassPassive } from 'src/modules/core/models/class-passive.model';
import { PlayerClass, PlayerModel } from 'src/modules/core/models/player.model';
import { CapitalizeFirstPipe } from 'src/modules/core/pipes/capitalize-first.pipe';
import { ClassSelectorComponent } from 'src/modules/game/activities/edit-character/components/character-selector/character-selector.component';
import { getStatIcon } from 'src/modules/utils';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';
import { ItemBoxComponent } from '../item-box/item-box.component';

@Component({
  selector: 'app-character-class-info',
  standalone: true,
  imports: [CommonModule, ItemBoxComponent, NgbTooltipModule, CapitalizeFirstPipe],
  templateUrl: './character-class-info.component.html',
  styleUrls: ['./character-class-info.component.scss']
})
export class CharacterClassInfoComponent {
  @Input() characterImage: string;
  @Input() characterClass: PlayerClass;
  @Input() classPassives: Record<string, ClassPassive>;
  @Input() showActiveSkin: boolean = false;
  @Input() readOnly: boolean = false;
  @Output() classPicked = new EventEmitter<{ selectedClass: PlayerClass, selectedSkin: string }>();
  PlayerClass = PlayerClass;
  imagePrefix = ViewportService.getPreffixImg();
  store = inject(Store);
  modalService = inject(BsModalService);
  playerService = inject(PlayerService);
  getClassPassivesForCurrentClass(): ClassPassive {
    return this.classPassives[this.characterClass];
  }

  getObjectEntries(obj: any) {
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }

  getStatIcon(stat: string): string {
    return getStatIcon(stat);
  }

  public openCharacterSelector() {
    const player = this.store.selectSnapshot(
      MainState.getPlayer
    ) as PlayerModel;
    const config: ModalOptions = {
      initialState: {
        pickClass: (selectedClass, selectedSkin) => {
          this.classPicked.emit({ selectedClass: selectedClass, selectedSkin: selectedSkin });
          modalRef.hide();
        },
        selectedClass: player?.clazz,
        _selectedSkin: player?.activeSkin,
        showSelectSkin: this.showActiveSkin,
        ownedSkins: player?.unlockedPortraitsIds,
      },
    };
    const modalRef = this.modalService.show(ClassSelectorComponent, config);
  }



  getEffectTooltip(effect: any): string {
    return `
      <div class="tooltip-content">
        <h6>${effect.name}</h6>
        <p>${effect.description}</p>
      </div>
    `;
  }
}
