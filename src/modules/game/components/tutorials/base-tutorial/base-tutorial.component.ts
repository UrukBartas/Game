import { Component, inject } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-base-tutorial',
  templateUrl: './base-tutorial.component.html',
  styleUrl: './base-tutorial.component.scss',
})
export class BaseTutorialComponent {
  modal = inject(BsModalService);
  closeTutorial() {
    this.modal.hide();
  }
}
