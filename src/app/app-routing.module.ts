import { NgModule, Type } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterReferralComponent } from 'src/modules/game/activities/campaigns/register-referral/register-referral.component';
import { GameModule } from 'src/modules/game/game.module';

const routes: Routes = [
  {
    path: '',
    loadChildren: (): Promise<Type<GameModule>> =>
      import('../modules/game/game.module').then((m) => m.GameModule),
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
