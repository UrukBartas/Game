import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameLayoutComponent } from './components/game-layout/game-layout.component';
import { CharacterComponent } from './activities/character/character.component';

const routes: Routes = [
  {
    path: '',
    component: GameLayoutComponent,
    children: [
      {
        path: '',
        component: CharacterComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameRoutingModule {}
