
import { NgModule, Type } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RedirectPageComponent } from 'src/modules/core/components/redirect-page/redirect-page.component';
import { RegisterReferralComponent } from 'src/modules/game/activities/campaigns/register-referral/register-referral.component';
import { ConnectComponent } from 'src/modules/game/activities/connect/connect.component';
import { GameModule } from 'src/modules/game/game.module';
export enum RedirectPageTypes {
  EMAIL,
}
const routes: Routes = [
  {
    path: '',
    component: ConnectComponent,
    title: 'Login',
  },
  {
    path: 'reset-password',
    component: ConnectComponent,
    title: 'Reset password',
    data: {
      resetPassword: true,
    },
  },
  {
    path: 'verify-email',
    component: RedirectPageComponent,
    title: 'Verify email',
    data: {
      type: RedirectPageTypes.EMAIL,
      successMessage: 'Your email has been successfully verified! 🎉',
      failureMessage: 'Failed to verify your email. Please try again later.',
      loadingMessage: 'Verifying your email...',
    },
  },
  {
    path: '',
    loadChildren: (): Promise<Type<GameModule>> =>
      import('../modules/game/game.module').then((m) => m.GameModule),
  },
  {
    path: 'black-market',
    loadChildren: () =>
      import('../modules/black-market/black-market.module').then(
        (m) => m.BlackMarketModule
      ),
  },
  {
    path: 'external',
    children: [
      {
        path: 'register-referral',
        component: RegisterReferralComponent,
        title: 'Register referral',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
