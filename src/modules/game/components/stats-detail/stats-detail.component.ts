import { Component, Input, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { take } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { ClassPassive } from 'src/modules/core/models/class-passive.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { getPvpTier, getQuestTier, getRarityColor } from 'src/modules/utils';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { LoadClassPassives, MainState, RefreshPlayer } from 'src/store/main.store';
import { ClassSelectorComponent } from '../../activities/edit-character/components/character-selector/character-selector.component';
import { TitleGeneratorModalComponent } from '../title-generator-modal/title-generator-modal.component';

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
  classPassives: Record<string, ClassPassive> = {};
  public prefix = ViewportService.getPreffixImg();
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
    return getPvpTier(pvpIndex);
  }

  public getQuestTier(questCount: number) {
    return getQuestTier(questCount);
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

  ngOnInit() {
    // Cargar las pasivas de clase
    this.loadClassPassives();
  }

  public openTitleSelector() {
    this.modalService.show(TitleGeneratorModalComponent);
  }

  public onClassPicked(event: { selectedClass: any, selectedSkin: any }) {
    if (event.selectedClass) {
      this.playerService.updateClass(event.selectedClass.clazz, event.selectedSkin.id).pipe(take(1)).subscribe((player) => {
        this.store.dispatch(new RefreshPlayer());
      });
    }
  }

  private loadClassPassives() {
    const passives = this.store.selectSnapshot(MainState.getClassPassives);
    if (!passives || Object.keys(passives).length === 0) {
      this.store.dispatch(new LoadClassPassives()).subscribe(() => {
        this.classPassives = this.store.selectSnapshot(MainState.getClassPassives);
      });
    } else {
      this.classPassives = passives;
    }
  }
}
