import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CompressNumberPipe } from 'src/modules/core/pipes/compress-number.pipe';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-uruks-displayer',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule, CompressNumberPipe],
  templateUrl: './uruks-displayer.component.html',
  styleUrl: './uruks-displayer.component.scss',
})
export class UruksDisplayerComponent {
  @Input({ required: true }) goldenUruks: number;
  public prefix = ViewportService.getPreffixImg();
}
