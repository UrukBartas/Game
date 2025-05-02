import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngxs/store';
import { cloneDeep } from 'lodash-es';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { firstValueFrom } from 'rxjs';
import { ClassPassive } from 'src/modules/core/models/class-passive.model';
import {
  MiscellanyItemData,
  MiscellanyItemIdentifier,
} from 'src/modules/core/models/misc.model';
import { PlayerClass } from 'src/modules/core/models/player.model';
import { getRarityColor, getStatIcon } from 'src/modules/utils';
import { MiscellanyService } from 'src/services/miscellany.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { mapPercentLabels } from 'src/standalone/item-tooltip/item-tooltip.component';
import { LoadClassPassives, MainState, RefreshPlayer, SetSkins } from 'src/store/main.store';
import SwiperCore, {
  EffectCoverflow,
  Navigation,
  Pagination,
  SwiperOptions,
} from 'swiper';
import { baseSkins, classData } from './const/class-data.const';

SwiperCore.use([EffectCoverflow, Navigation, Pagination]);

@Component({
  selector: 'app-character-selector',
  templateUrl: './character-selector.component.html',
  styleUrl: './character-selector.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ClassSelectorComponent implements OnInit {
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    initialSlide: 0,
    spaceBetween: 10,
    navigation: true,
    effect: 'coverflow',
    coverflowEffect: {
      rotate: 100,
      stretch: 1,
      depth: 100,
      modifier: 1,
      slideShadows: false,
    },
    keyboard: {
      enabled: true,
    },
  };

  modalRef = inject(BsModalRef);
  store = inject(Store);
  imagePrefix = ViewportService.getPreffixImg();
  classes = [];
  selectedClass!: PlayerClass;
  skins: MiscellanyItemData[] = [];

  showSelectSkin = true;
  pickingSkin = false;
  ownedSkins: string[] = [];

  _selectedSkin: string;
  get selectedSkin(): MiscellanyItemData {
    if (!this._selectedSkin) {
      return null;
    }
    return this.skins.find((skin) => skin.id === this._selectedSkin);
  }

  private miscellanyService = inject(MiscellanyService);
  private playerService = inject(PlayerService);
  public getRarityColor = getRarityColor;

  classPassives: Record<string, ClassPassive> = {};

  constructor() {
    this.classes = cloneDeep(classData);
    this.selectedClass = classData[0].clazz;
    this.skins = cloneDeep(baseSkins);
  }

  pickClass: (selectedClass, selectedSkin) => void;

  isSkinOwned(skin: MiscellanyItemData) {
    return this.ownedSkins.includes(skin.id) || skin.extraData.free;
  }

  ngOnInit(): void {
    this.loadSkins();

    if (this.selectedSkin) {
      const selectedClassIndex = this.classes.findIndex(
        (clazz) => clazz.clazz === this.selectedSkin.extraData.clazz
      );
      this.selectSkin(this.selectedSkin);
      this.swiperConfig.initialSlide = selectedClassIndex;
    }

    this.loadClassPassives();
  }

  private loadSkins() {
    const skins = this.store.selectSnapshot(MainState.getSkins);

    if (!skins) {
      this.miscellanyService.getAllPortraits().subscribe((skins) => {
        if (skins) {
          this.store.dispatch(new SetSkins(skins));
          this.skins.push(...skins);
        }
      });
    } else {
      this.skins.push(...skins);
    }
  }

  onSlideChange(event) {
    this.selectedClass = classData[event.activeIndex].clazz;
    this._selectedSkin = this.getClassSkins()[0].id;
  }

  getClassSkins() {
    return this.skins?.filter(
      (skin) => skin.extraData.clazz === this.selectedClass
    ).filter(skin => !!skin);
  }

  selectSkin(skin: MiscellanyItemData) {
    this._selectedSkin = skin.id;
    const selectedClassIndex = this.classes.findIndex(
      (clazz) => clazz.clazz === this.selectedClass
    );
    this.classes[selectedClassIndex].img = skin.imageLocal;
  }

  async saveSkin(idSkin: MiscellanyItemIdentifier) {
    this.pickingSkin = false;
    await firstValueFrom(
      this.playerService.updateClass(this.selectedClass, idSkin)
    );
    this.store.dispatch(new RefreshPlayer());
  }

  openSkinSelector() {
    this.pickingSkin = true;
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

  public getClassPassivesForSelectedClass(): ClassPassive {
    return this.classPassives[this.selectedClass];
  }

  public getStatIcon = getStatIcon;

  public getStatName(stat: string): string {
    return mapPercentLabels[stat];
  }

  public getObjectEntries(obj: any): { key: string, value: any }[] {
    if (!obj) return [];
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }
}
