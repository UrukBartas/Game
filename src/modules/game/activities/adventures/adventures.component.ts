import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, firstValueFrom, map } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import {
  AdventureData,
  AdventuresDataService,
} from 'src/services/adventures-data.service';
import { MainState } from 'src/store/main.store';

@Component({
  selector: 'app-adventures',
  templateUrl: './adventures.component.html',
  styleUrl: './adventures.component.scss',
})
export class AdventuresComponent extends TemplatePage {
  adventureData = inject(AdventuresDataService);
  store = inject(Store);
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
      const activeQuest = this.selectedAdventure.Adventure[0].quests.find(
        (quest) => quest.active
      );
      if (!!activeQuest) this.activeWallpaper = activeQuest.data.image;
    }
    this.availableAdventures$.next(adventures);
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
}
