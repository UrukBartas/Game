import { NgModule, Type } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameModule } from 'src/modules/game/game.module';

const routes: Routes = [
  {
    path: '',
    loadChildren: (): Promise<Type<GameModule>> =>
      import('../modules/game/game.module').then((m) => m.GameModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
