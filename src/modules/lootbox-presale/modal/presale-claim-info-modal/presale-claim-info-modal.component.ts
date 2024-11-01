import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { WalletService } from 'src/services/wallet.service';

@Component({
  selector: 'app-presale-claim-info-modal',
  standalone: true,
  imports: [],
  templateUrl: './presale-claim-info-modal.component.html',
  styleUrl: './presale-claim-info-modal.component.scss',
})
export class PresaleClaimInfoModalComponent {
  modalRef = inject(BsModalRef);
  walletService = inject(WalletService);
  router = inject(Router);

  public preffix = environment.permaLinkImgPref;

  public async redirectToOpenBox() {
    const address = await firstValueFrom(this.walletService.getValidAddress$);
    localStorage.setItem(
      address,
      JSON.stringify({
        presale: {
          timestamp: +new Date(),
        },
      })
    );
    this.modalRef.hide();
    this.router.navigate(['']);
  }
}
