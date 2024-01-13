import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { CharacterComponent } from './activities/character/character.component';
import { StatsDetailComponent } from './activities/stats-detail/stats-detail.component';
import { ExportImportNftComponent } from './activities/export-import-nft/export-import-nft.component';

const routes: Routes = [
  {
    path: '',
    component: GameLayoutComponent,
    children: [
      {
        path: '',
        component: CharacterComponent,
      },
      {
        path: 'stats',
        component: StatsDetailComponent,
      },
      {
        path: 'export-import',
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
