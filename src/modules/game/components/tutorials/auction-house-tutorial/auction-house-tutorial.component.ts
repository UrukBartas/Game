import { Component } from '@angular/core';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-auction-house-tutorial',
  templateUrl: './auction-house-tutorial.component.html',
  styleUrl: './auction-house-tutorial.component.scss'
})
export class AuctionHouseTutorialComponent {
public prefix = ViewportService.getPreffixImg();
}
