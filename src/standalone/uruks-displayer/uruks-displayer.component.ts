import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { CompressNumberPipe } from 'src/modules/core/pipes/compress-number.pipe';

@Component({
  selector: 'app-uruks-displayer',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule, CompressNumberPipe],
  templateUrl: './uruks-displayer.component.html',
  styleUrl: './uruks-displayer.component.scss',
})
export class UruksDisplayerComponent {
  @Input({ required: true }) goldenUruks: number;
  public prefix = environment.permaLinkImgPref;
}
