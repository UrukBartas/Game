import { Component, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-item-set-modal',
  templateUrl: './item-set-modal.component.html',
  styleUrl: './item-set-modal.component.scss',
})
export class ItemSetModalComponent {
  title: string;
  description: string;
  accept;
  cancel;
  modalRef = inject(BsModalRef);
  name = new FormControl('', [Validators.required]);
}
