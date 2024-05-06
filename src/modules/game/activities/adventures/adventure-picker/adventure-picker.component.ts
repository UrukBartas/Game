import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  inject,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { getRarityColor } from 'src/modules/utils';
import {
  AdventureData,
  AdventuresDataService,
} from 'src/services/adventures-data.service';
import { PlayerService } from 'src/services/player.service';
import { QuestService } from 'src/services/quest.service';
import { ViewportService } from 'src/services/viewport.service';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { Adventure, AdventuresService } from 'src/services/adventures.service';

@Component({
  selector: 'app-adventure-picker',
  templateUrl: './adventure-picker.component.html',
  styleUrl: './adventure-picker.component.scss',
})
export class AdventurePickerComponent extends TemplatePage {
  @Input() selectedAdventure: AdventureData;
  @Output() onStartedAdventure = new EventEmitter<Adventure>();
  startedAdventure = false;
  getRarityColor = getRarityColor;
  activeSlideIndex = 0;
  modalService = inject(BsModalService);
  titleService = inject(Title);
  adventureService = inject(AdventuresService);
  adventureDataService = inject(AdventuresDataService);

  constructor(public viewportService: ViewportService) {
    super();
    this.titleService.setTitle('Pick an adventure');
  }

  async startAdventure() {
    this.adventureService
      .startAdventure(this.selectedAdventure.id)
      .subscribe((data) => this.onStartedAdventure.emit(data));
  }

  getResponsiveButtonSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return '0.8em 3em';
      case 'md':
        return '0.4em 1.5em';
      case 'xs':
      case 'sm':
      default:
        return '0.3em 1em';
    }
  }

  getResponsiveButtonFontSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
        return 'calc(1.325rem + 0.9vw)';
      case 'xl':
      case 'lg':
        return 'calc(1.3rem + 0.6vw)';
      case 'md':
        return 'calc(1.275rem + 0.3vw)';
      case 'xs':
      case 'sm':
      default:
        return '3.25rem';
    }
  }

  public getItemBoxSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm' ||
      this.viewportService.screenSize == 'md'
    ) {
      return 50;
    }
    return 100;
  }

  public separateByParagraph(description: string) {
    return description
      .replace(/\n/g, '')
      .trim()
      .split('.')
      .filter((p) => p.length > 5);
  }
}
