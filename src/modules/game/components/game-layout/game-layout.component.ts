import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from 'src/services/account.service';

@Component({
  selector: 'app-game-layout',
  templateUrl: './game-layout.component.html',
  styleUrl: './game-layout.component.scss',
})
export class GameLayoutComponent {
  public routesNavigation = [
    {
      path: '/',
      displayText: 'Character',
      icon: 'fa fa-home',
    },
  ];
  public isSidebarOpened = signal(true);
  public router = inject(Router);
  public account = inject(AccountService);
  constructor() {}

  public toggleSidebarOpened(): void {
    this.isSidebarOpened.update((currentValue) => !currentValue);
  }
}
