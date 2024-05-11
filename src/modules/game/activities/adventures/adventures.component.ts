import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, firstValueFrom, map } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import {
  AdventureData,
  AdventuresDataService,
} from 'src/services/adventures-data.service';
import { ViewportService } from 'src/services/viewport.service';
import { MainState } from 'src/store/main.store';

@Component({
  selector: 'app-adventures',
  templateUrl: './adventures.component.html',
  styleUrl: './adventures.component.scss',
})
export class AdventuresComponent extends TemplatePage {
  adventureData = inject(AdventuresDataService);
  store = inject(Store);
  viewportService = inject(ViewportService);
  toastService = inject(ToastrService);
  public availableAdventures$ = new BehaviorSubject<AdventureData[]>([]);
  public selectedAdventure!: AdventureData;
  public player$ = this.store
    .select(MainState.getState)
    .pipe(map((entry) => entry.player));
  public activeWallpaper = '../../../../assets/backgrounds/adventures.png';
  constructor() {
    super();
    this.refreshAdventures();
  }
  ngOnInit(): void {}

  public selectAdventure(adventure: AdventureData) {
    this.selectedAdventure = adventure;
    this.activeWallpaper = this.selectedAdventure.image;
    this.getActiveWallpaperFromQuest();
  }

  public async refreshAdventures() {
    const adventures = await firstValueFrom(
      this.adventureData.getAvailableAdventures()
    );
    const adventureInProgress = adventures.find(
      (adventure) =>
        adventure.Adventure &&
        adventure.Adventure.length > 0 &&
        !adventure.Adventure[0].completed
    );
    if (adventureInProgress) this.selectedAdventure = adventureInProgress;
    if (this.selectedAdventure) {
      this.selectedAdventure = adventures.find(
        (adventure) => adventure.id == this.selectedAdventure.id
      );
      this.activeWallpaper = this.selectedAdventure.image;
      this.getActiveWallpaperFromQuest();
    }
    this.availableAdventures$.next(adventures);
  }

  public async goNext() {
    const allAdventures = this.availableAdventures$.getValue();
    const indexSelectedAdventure = allAdventures.findIndex(
      (adventure) => adventure.id == this.selectedAdventure.id
    );
    if (indexSelectedAdventure >= 0) {
      if (indexSelectedAdventure + 1 > allAdventures.length - 1) {
        this.toastService.warning('There are no more adventures yet!');
      } else {
        this.selectAdventure(allAdventures[indexSelectedAdventure + 1]);
      }
    }
  }

  private getActiveWallpaperFromQuest() {
    const activeQuest = this.selectedAdventure.Adventure[0].quests
      .sort((a, b) => a.data.phase - b.data.phase)
      .find((quest) => quest.active);

    if (!!activeQuest) this.activeWallpaper = activeQuest.data.image;
  }

  public getAdventureStackLabel(adventure: AdventureData) {
    let adventureSelected = null;
    if (adventure?.Adventure?.length > 0) {
      adventureSelected = adventure.Adventure[0];
    }
    if (adventureSelected && !adventureSelected?.completed) {
      return `${adventureSelected.currentPhase + 1}/${adventureSelected.quests.length}`;
    } else if (adventureSelected?.completed) {
      return `Done`;
    } else {
      return '';
    }
  }

  getResponsiveButtonFontSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
      case 'md':
      case 'sm':
        return '3rem';
      default:
        return '2rem';
    }
  }

  getResponsiveSizeAdventureImgs() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
      case 'md':
        return [170, 140];
      default:
        return [75, 60];
    }
  }
}
