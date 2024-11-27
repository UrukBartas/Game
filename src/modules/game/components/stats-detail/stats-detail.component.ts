import { Component, Input, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { getRarityColor } from 'src/modules/utils';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';
import { ClassSelectorComponent } from '../../activities/edit-character/components/character-selector/character-selector.component';
import { pvpTiers } from '../../activities/leadeboard/const/pvp-tiers';
import { questTiers } from '../../activities/leadeboard/const/quest-tiers';

@Component({
  selector: 'app-stats-detail',
  templateUrl: './stats-detail.component.html',
  styleUrls: ['./stats-detail.component.scss'],
})
export class StatsDetailComponent extends TemplatePage {
  public store: Store = inject(Store);
  @Input() player!: PlayerModel;
  @Input() isViewingAnotherPlayer = false;

  private viewportService = inject(ViewportService);
  private modalService = inject(BsModalService);
  private playerService = inject(PlayerService);
  getRarityColor = getRarityColor;
  public prefix = environment.permaLinkImgPref;
  public getPlayerImageSize() {
    if (
      this.viewportService.screenSize === 'xs' ||
      this.viewportService.screenSize === 'sm' ||
      this.viewportService.screenSize === 'md'
    ) {
      return 120;
    }
    return 180;
  }

  public getPvpTier(pvpIndex: number) {
    return pvpTiers.find(
      (tier) => pvpIndex >= tier.range[0] && pvpIndex <= tier.range[1]
    );
  }

  public getQuestTier(questCount: number) {
    for (let i = questTiers.length - 1; i >= 0; i--) {
      if (questCount >= questTiers[i].maxQuests) {
        return questTiers[i];
      }
    }

    return questTiers[0];
  }

  public openSkinSelector() {
    const { clazz, image, unlockedPortraitsIds, activeSkin } =
      this.store.selectSnapshot(MainState.getPlayer);
    const config: ModalOptions = {
      initialState: {
        pickClass: (selectedClass, selectedSkin) => {
          if (selectedClass) {
            const { clazz, img } = selectedClass;
            this.playerService
              .updateClass(clazz, selectedSkin.id)
              .pipe(take(1))
              .subscribe((player) => {
                this.store.dispatch(new RefreshPlayer());
              });
          }
          modalRef.hide();
        },
        showSelectSkin: true,
        pickingSkin: true,
        selectedClass: clazz,
        _selectedSkin: activeSkin,
        ownedSkins: unlockedPortraitsIds,
      },
    };
    const modalRef = this.modalService.show(ClassSelectorComponent, config);
  }
}
