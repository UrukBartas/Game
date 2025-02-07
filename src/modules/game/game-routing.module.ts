import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuctionHouseComponent } from './activities/auction-house/auction-house.component';
import { BlacksmithComponent } from './activities/blacksmith/blacksmith.component';
import { EditCharacterComponent } from './activities/edit-character/edit-character.component';
import { ExportImportNftComponent } from './activities/export-import-nft/export-import-nft.component';
import { InventoryComponent } from './activities/inventory/inventory.component';
import { LeadeboardComponent } from './activities/leadeboard/leadeboard.component';
import { MissionsComponent } from './activities/missions/missions.component';
import { AutoPvpFightComponent } from './activities/pvp/pvp-autofight/pvp-autofight.component';
import { PvPFightComponent } from './activities/pvp/pvp-fight/pvp-fight.component';
import { PvPResultComponent } from './activities/pvp/pvp-result/pvp-result.component';
import { QuestRouterComponent } from './activities/quests/quest-router.component';
import { ShopComponent } from './activities/shop/shop.component';
import { ShoppingComponent } from './activities/shopping/shopping.component';
import { TheCryptComponent } from './activities/the-crypt/the-crypt.component';
import { TheMineComponent } from './activities/the-mine/the-mine.component';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { StatsDetailComponent } from './components/stats-detail/stats-detail.component';

const routes: Routes = [
  {
    path: '',
    component: GameLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'inventory',
        pathMatch: 'full',
      },
      {
        path: 'auction-house',
        canActivate: [AuthGuard],
        component: AuctionHouseComponent,
        title: 'Auction house',
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
        path: 'missions',
        canActivate: [AuthGuard],
        component: MissionsComponent,
        title: 'Missions',
      },
      {
        path: 'shopping',
        canActivate: [AuthGuard],
        component: ShoppingComponent,
        title: 'Shopping',
      },
      {
        path: 'quests',
        canActivate: [AuthGuard],
        component: QuestRouterComponent,
        title: 'Quests',
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
        path: 'the-mine',
        canActivate: [AuthGuard],
        component: TheMineComponent,
        title: 'The Mine',
      },
      {
        path: 'the-crypt',
        canActivate: [AuthGuard],
        component: TheCryptComponent,
        title: 'The Crypt',
      },
      {
        path: 'leaderboard',
        canActivate: [AuthGuard],
        component: LeadeboardComponent,
        title: 'Leaderboard',
      },
      {
        path: 'arena/pvp',
        canActivate: [AuthGuard],
        component: PvPFightComponent,
        title: 'Arena',
      },
      {
        path: 'arena/auto',
        canActivate: [AuthGuard],
        component: AutoPvpFightComponent,
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
