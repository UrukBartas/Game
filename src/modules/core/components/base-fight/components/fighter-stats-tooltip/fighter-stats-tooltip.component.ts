import { Component, Input } from '@angular/core';
import { getRarityBasedOnIRI, getRarityColor } from 'src/modules/utils';
import { BaseFighterModel } from '../../models/base-fight.model';

@Component({
  selector: 'app-fighter-stats-tooltip',
  templateUrl: './fighter-stats-tooltip.component.html',
  styleUrl: './fighter-stats-tooltip.component.scss',
})
export class FighterStatsTooltipComponent {
  @Input() fighter: BaseFighterModel;

  public getRarityColor = getRarityColor;
  public getRarityBasedOnIRI = getRarityBasedOnIRI;
}
