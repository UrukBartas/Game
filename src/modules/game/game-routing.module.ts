import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { CharacterComponent } from './activities/character/character.component';
import { StatsDetailComponent } from './activities/stats-detail/stats-detail.component';
import { EditCharacterComponent } from './activities/edit-character/edit-character.component';
import { ExportImportNftComponent } from './activities/export-import-nft/export-import-nft.component';
import { ConnectComponent } from './activities/connect/connect.component';
import { AuthGuard } from 'src/guards/auth.guard';
import { QuestsComponent } from './activities/quests/quests.component';

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
        component: CharacterComponent,
      },
      {
        path: 'stats',
        canActivate: [AuthGuard],
        component: StatsDetailComponent,
      },
      {
        path: 'quests',
        canActivate: [AuthGuard],
        component: QuestsComponent,
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
