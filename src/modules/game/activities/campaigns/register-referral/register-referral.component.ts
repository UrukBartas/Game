import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { disconnect, getAccount, signMessage } from '@wagmi/core';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, switchMap, take } from 'rxjs';
import { AuthService } from 'src/services/auth.service';
import { CampaignService, CampaignType } from 'src/services/campaign.service';
import { ViewportService } from 'src/services/viewport.service';
import { WalletService } from 'src/services/wallet.service';
import { DisconnectWallet } from 'src/store/main.store';

@Component({
  selector: 'app-register-referral',
  templateUrl: './register-referral.component.html',
  styleUrl: './register-referral.component.scss',
})
export class RegisterReferralComponent {
  viewportService = inject(ViewportService);
  campaignService = inject(CampaignService);
  public getCampaignsCount$ =
    this.campaignService.getCampaignsCount('RegisterReferral');
  walletService = inject(WalletService);
  authService = inject(AuthService);
  store = inject(Store);
  router = inject(Router);
  private toastService = inject(ToastrService);

  ngOnInit(): void {
    this.store.dispatch(new DisconnectWallet());
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

  public async generateCampaign() {
    const loggedIn = await firstValueFrom(this.walletService.logIn());
    if (loggedIn) {
      this.toastService.error('You already have an account created!');
    } else {
      const address: string = getAccount().address ?? '';
      try {
        await firstValueFrom(
          this.campaignService.generateCampaign({
            playerId: address,
            type: CampaignType.RegisterReferral,
            data: { uruksToAdd: 1 },
          })
        );
        this.router.navigate(['/create'], {});
      } catch (error:any) {
        this.toastService.error(error?.error?.message ?? 'An unexpected error happened while creating the campaign');
      }
    }
  }
}
