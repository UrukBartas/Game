import { Component, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-stake-remove-request-modal',
  templateUrl: './stake-remove-request-modal.component.html',
  styleUrl: './stake-remove-request-modal.component.scss',
})
export class StakeRemoveRequestModalComponent {
  title: string;
  description: string;
  accept;
  cancel;
  modalRef = inject(BsModalRef);
  maxAmount = 0;
  input = new FormControl(0, [Validators.required]);
}
