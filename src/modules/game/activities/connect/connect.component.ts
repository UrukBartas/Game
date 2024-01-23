import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { WalletService } from 'src/services/wallet.service';
import { MainState } from 'src/store/main.store';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
})
export class ConnectComponent extends TemplatePage implements OnInit {
  walletService = inject(WalletService);
  store = inject(Store);
  router = inject(Router);

  ngOnInit(): void {
    const player = this.store.selectSnapshot(MainState.getState).player;
    if (player) {
      this.router.navigateByUrl('/inventory');
    }
  }
}
