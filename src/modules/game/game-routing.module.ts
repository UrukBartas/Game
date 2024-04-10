import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/guards/auth.guard';
import { ConnectComponent } from './activities/connect/connect.component';
import { EditCharacterComponent } from './activities/edit-character/edit-character.component';
import { ExportImportNftComponent } from './activities/export-import-nft/export-import-nft.component';
import { InventoryComponent } from './activities/inventory/inventory.component';
import { LeadeboardComponent } from './activities/leadeboard/leadeboard.component';
import { QuestRouterComponent } from './activities/quests/quest-router.component';
import { ShopComponent } from './activities/shop/shop.component';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { StatsDetailComponent } from './components/stats-detail/stats-detail.component';
import { RegisterReferralComponent } from './activities/campaigns/register-referral/register-referral.component';
import { BlacksmithComponent } from './activities/blacksmith/blacksmith.component';

const routes: Routes = [
  {
    path: '',
    component: GameLayoutComponent,
    children: [
      {
        path: '',
        component: ConnectComponent,
      },
      {
        path: 'inventory',
        canActivate: [AuthGuard],
        component: InventoryComponent,
      },
      {
        path: 'view-player/:id',
        component: InventoryComponent,
      },
      {
        path: 'stats',
        canActivate: [AuthGuard],
        component: StatsDetailComponent,
      },
      {
        path: 'quests',
        canActivate: [AuthGuard],
        component: QuestRouterComponent,
      },
      {
        path: 'shop',
        canActivate: [AuthGuard],
        component: ShopComponent,
      },
      {
        path: 'blacksmith',
        canActivate: [AuthGuard],
        component: BlacksmithComponent,
      },
      {
        path: 'edit',
        canActivate: [AuthGuard],
        component: EditCharacterComponent,
      },
      {
        path: 'create',
        component: EditCharacterComponent,
      },
      {
        path: 'export-import',
        canActivate: [AuthGuard],
        component: ExportImportNftComponent,
      },
      {
        path: 'leaderboard',
        canActivate: [AuthGuard],
        component: LeadeboardComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameRoutingModule {}
