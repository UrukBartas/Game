import { Component, inject } from '@angular/core';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { WalletService } from 'src/services/wallet.service';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
})
export class ConnectComponent extends TemplatePage {
  walletService = inject(WalletService);
}
