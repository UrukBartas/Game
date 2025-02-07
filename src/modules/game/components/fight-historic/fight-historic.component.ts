import { Component, inject, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { PvPFightService } from 'src/services/pvp-fight.service';
import { ViewportService } from 'src/services/viewport.service';
import { PVPHistoricModel } from './models/pvp-historic.model';

@Component({
  selector: 'app-fight-historic',
  templateUrl: './fight-historic.component.html',
  styleUrls: ['./fight-historic.component.scss'],
})
export class FightHistoricComponent extends TemplatePage {
  private pvpService = inject(PvPFightService);
  getPlayerHistoric$: Observable<PVPHistoricModel[]>;
  currentPage: number = 0;
  pageSize: number = 10;
  playerId: string;
  public prefix = ViewportService.getPreffixImg();
  @Input() set player(player: PlayerModel) {
    if (player) {
      this.playerId = player.id;
      this.loadHistoric();
    }
  }

  loadHistoric() {
    this.getPlayerHistoric$ = this.pvpService.getHistoric(
      this.playerId,
      this.pageSize,
      this.currentPage * this.pageSize
    );
  }

  nextPage() {
    this.currentPage++;
    this.loadHistoric();
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadHistoric();
    }
  }
}
