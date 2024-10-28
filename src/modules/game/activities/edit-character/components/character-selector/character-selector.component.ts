import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';
import { PlayerClass } from 'src/modules/core/models/player.model';
import { MiscellanyService } from 'src/services/miscellany.service';
import SwiperCore, {
  EffectCoverflow,
  Navigation,
  Pagination,
  SwiperOptions,
} from 'swiper';
import { baseSkins, classData } from './const/class-data.const';
import { MiscellanyItemData } from 'src/modules/core/models/misc.model';
import { getRarityColor } from 'src/modules/utils';

SwiperCore.use([EffectCoverflow, Navigation, Pagination]);

@Component({
  selector: 'app-character-selector',
  templateUrl: './character-selector.component.html',
  styleUrl: './character-selector.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ClassSelectorComponent implements OnInit {
  modalRef = inject(BsModalRef);
  imagePrefix = environment.permaLinkImgPref;
  classes = classData;
  selectedClass: PlayerClass = classData[0].clazz;
  PlayerClass = PlayerClass;
  pickingSkin = false;
  skins: MiscellanyItemData[] = baseSkins;
  selectedSkin: MiscellanyItemData;
  showSelectSkin = true;
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
  private miscellanyService = inject(MiscellanyService);
  public getRarityColor = getRarityColor;

  pickClass: (selectedClass) => void;

  ngOnInit(): void {
    this.miscellanyService.getAllPortraits().subscribe((skins) => {
      if (skins) {
        this.skins.push(...skins);
      }
    });
  }

  onSlideChange(event) {
    this.selectedClass = classData[event.activeIndex].clazz;
    this.selectedSkin = this.getClassSkins()[0];
  }

  getClassSkins() {
    return this.skins.filter(
      (skin) => skin.extraData.clazz === this.selectedClass
    );
  }

  selectSkin(skin: MiscellanyItemData) {
    this.selectedSkin = skin;
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
    this.selectedSkin = this.getClassSkins()[0];
  }
}
