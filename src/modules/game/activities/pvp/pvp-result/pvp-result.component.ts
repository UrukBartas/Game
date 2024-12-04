import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PvPFightService } from 'src/services/pvp-fight.service';

@Component({
  selector: 'app-pvp-result',
  templateUrl: './pvp-result.component.html',
  styleUrl: './pvp-result.component.scss',
})
export class PvPResultComponent {
  public fightService = inject(PvPFightService);
  public router = inject(Router);
  public getLastMatch$ = this.fightService.getLastMatch();
}
