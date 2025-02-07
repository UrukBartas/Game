import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-the-mine-info-modal',
  standalone: true,
  imports: [],
  templateUrl: './the-mine-info-modal.component.html',
  styleUrl: './the-mine-info-modal.component.scss',
})
export class TheMineInfoModalComponent {
  modalRef = inject(BsModalRef);
  router = inject(Router);
  public prefix = ViewportService.getPreffixImg();
}
