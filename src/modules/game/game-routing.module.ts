import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdventuresComponent } from './activities/adventures/adventures.component';
import { BlacksmithComponent } from './activities/blacksmith/blacksmith.component';
import { ConnectComponent } from './activities/connect/connect.component';
import { EditCharacterComponent } from './activities/edit-character/edit-character.component';
import { ExportImportNftComponent } from './activities/export-import-nft/export-import-nft.component';
import { InventoryComponent } from './activities/inventory/inventory.component';
import { LeadeboardComponent } from './activities/leadeboard/leadeboard.component';
import { PvPResultComponent } from './activities/pvp/pv-presult/pvp-result.component';
import { PvPFightComponent } from './activities/pvp/pvp-fight/pvp-fight.component';
import { QuestRouterComponent } from './activities/quests/quest-router.component';
import { ShopComponent } from './activities/shop/shop.component';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { StatsDetailComponent } from './components/stats-detail/stats-detail.component';

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
        title: 'Inventory',
      },
      {
        path: 'view-player/:id',
        component: InventoryComponent,
        title: 'View player',
      },
      {
        path: 'stats',
        canActivate: [AuthGuard],
        component: StatsDetailComponent,
        title: 'Stats',
      },
      {
        path: 'quests',
        canActivate: [AuthGuard],
        component: QuestRouterComponent,
        title: 'Quests',
      },
      {
        path: 'adventures',
        canActivate: [AuthGuard],
        component: AdventuresComponent,
        title: 'Adventures',
      },
      {
        path: 'shop',
        canActivate: [AuthGuard],
        component: ShopComponent,
        title: 'Shop',
      },
      {
        path: 'blacksmith',
        canActivate: [AuthGuard],
        component: BlacksmithComponent,
        title: 'Blacksmith',
      },
      {
        path: 'edit',
        canActivate: [AuthGuard],
        component: EditCharacterComponent,
        title: 'Edit character',
      },
      {
        path: 'create',
        component: EditCharacterComponent,
        title: 'Create character',
      },
      {
        path: 'export-import',
        canActivate: [AuthGuard],
        component: ExportImportNftComponent,
        title: 'Bridge',
      },
      {
        path: 'leaderboard',
        canActivate: [AuthGuard],
        component: LeadeboardComponent,
        title: 'Leaderboard',
      },
      {
        path: 'arena',
        canActivate: [AuthGuard],
        component: PvPFightComponent,
        title: 'Arena',
      },
      {
        path: 'arena-result',
        canActivate: [AuthGuard],
        component: PvPResultComponent,
        title: 'Arena result',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameRoutingModule {}
