import { Component, inject, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { PvPFightService } from 'src/services/pvp-fight.service';
import { PVPHistoricModel } from './models/pvp-historic.model';

@Component({
  selector: 'app-fight-historic',
  templateUrl: './fight-historic.component.html',
  styleUrl: './fight-historic.component.scss',
})
export class FightHistoricComponent extends TemplatePage {
  private pvpService = inject(PvPFightService);
  getPlayerHistoric$: Observable<PVPHistoricModel[]>;
  @Input() set player(player: PlayerModel) {
    this.getPlayerHistoric$ = this.pvpService.getHistoric(player.id);
  }
}
