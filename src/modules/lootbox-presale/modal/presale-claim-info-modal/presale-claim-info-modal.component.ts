import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-presale-claim-info-modal',
  standalone: true,
  imports: [],
  templateUrl: './presale-claim-info-modal.component.html',
  styleUrl: './presale-claim-info-modal.component.scss',
})
export class PresaleClaimInfoModalComponent {
  modalRef = inject(BsModalRef);
  router = inject(Router);
}
