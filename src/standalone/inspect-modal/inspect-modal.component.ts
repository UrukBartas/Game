import { Component, inject } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ViewportService } from 'src/services/viewport.service';

@Component({
  selector: 'app-inspect-modal',
  templateUrl: './inspect-modal.component.html',
  styleUrl: './inspect-modal.component.scss',
  standalone: true
})
export class InspectModalComponent {
  public prefix = ViewportService.getPreffixImg();
  modalRef = inject(BsModalRef);
  modalService = inject(BsModalService);

  public item: any; // Para recibir el item desde initialState

  public close() {
    // Cerrar el modal actual
    this.modalService.hide();
  }
}
