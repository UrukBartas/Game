import { Component, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import {
  AdventureData,
  AdventuresDataService,
} from 'src/services/adventures-data.service';

@Component({
  selector: 'app-adventures',
  templateUrl: './adventures.component.html',
  styleUrl: './adventures.component.scss',
})
export class AdventuresComponent extends TemplatePage {
  adventureData = inject(AdventuresDataService);
  public availableAdventures$ = new BehaviorSubject<AdventureData[]>([]);
  //public availableAdventures$ = this.adventureData.getAvailableAdventures();
  public selectedAdventure!: AdventureData;
  constructor() {
    super();
    this.refreshAdventures();
  }
  ngOnInit(): void {}

  public async refreshAdventures() {
    const adventures = await firstValueFrom(
      this.adventureData.getAvailableAdventures()
    );
    if (this.selectedAdventure) {
      this.selectedAdventure = adventures.find(
        (adventure) => adventure.id == this.selectedAdventure.id
      );
    }
    this.availableAdventures$.next(adventures);
  }
}
