import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { CharacterComponent } from './activities/character/character.component';
import { StatsDetailComponent } from './activities/stats-detail/stats-detail.component';
import { EditCharacterComponent } from './activities/edit-character/edit-character.component';

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
        path: 'edit',
        component: EditCharacterComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameRoutingModule {}
