import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { InventoryComponent } from './activities/inventory/inventory.component';
import { StatsDetailComponent } from './components/stats-detail/stats-detail.component';
import { ExportImportNftComponent } from './activities/export-import-nft/export-import-nft.component';
import { ConnectComponent } from './activities/connect/connect.component';
import { AuthGuard } from 'src/guards/auth.guard';
import { EditCharacterComponent } from './activities/edit-character/edit-character.component';
import { QuestRouterComponent } from './activities/quests/quest-router.component';
import { ShopComponent } from './activities/shop/shop.component';

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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameRoutingModule {}
