import { inject, Injectable } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RouteTrackingService {
  private previousUrl: string | null = null;

  private router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.previousUrl = event.urlAfterRedirects;
      });
  }

  getPreviousUrl(): string | null {
    return this.previousUrl;
  }

}
