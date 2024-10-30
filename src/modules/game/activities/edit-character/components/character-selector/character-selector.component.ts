import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';
import { MiscellanyItemData } from 'src/modules/core/models/misc.model';
import { PlayerClass } from 'src/modules/core/models/player.model';
import { getRarityColor } from 'src/modules/utils';
import { MiscellanyService } from 'src/services/miscellany.service';
import { MainState, SetSkins } from 'src/store/main.store';
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
  imagePrefix = environment.permaLinkImgPref;
  classes = [ ...classData ];
  selectedClass: PlayerClass = classData[0].clazz;
  skins: MiscellanyItemData[] = [ ...baseSkins ];

  showSelectSkin = true;
  pickingSkin = false;
  ownedSkins: string[] = [];

  _selectedSkin: string;
  get selectedSkin(): MiscellanyItemData {
    if (!this._selectedSkin) {
      return null;
    }
    return this.skins.find((skin) => skin.imageLocal === this._selectedSkin);
  }
 
  private miscellanyService = inject(MiscellanyService);
  public getRarityColor = getRarityColor;

  pickClass: (selectedClass) => void;

  isSkinOwned(skin: MiscellanyItemData) {
    return this.ownedSkins.includes(skin.id) || skin.extraData.free;
  }

  ngOnInit(): void {
    this.loadSkins();

    if (this.selectedSkin) {
      const selectedClassIndex = this.classes.findIndex(
        (clazz) => clazz.clazz === this.selectedSkin.extraData.clazz
      );
      this.swiperConfig.initialSlide = selectedClassIndex;
    }
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
    this._selectedSkin = this.getClassSkins()[0].imageLocal;
  }

  getClassSkins() {
    return this.skins?.filter(
      (skin) => skin.extraData.clazz === this.selectedClass
    );
  }

  selectSkin(skin: MiscellanyItemData) {
    this._selectedSkin = skin.imageLocal;
    const selectedClassIndex = this.classes.findIndex(
      (clazz) => clazz.clazz === this.selectedClass
    );
    this.classes[selectedClassIndex].img = skin.imageLocal;
  }

  saveSkin() {
    this.pickingSkin = false;
  }

  openSkinSelector() {
    this.pickingSkin = true;
  }

}
