import { Injectable, inject } from '@angular/core';
import {
  FirebaseMessaging,
  GetTokenOptions,
} from '@capacitor-firebase/messaging';
import { Capacitor } from '@capacitor/core';
import {
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  forkJoin,
  from,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngxs/store';
import { MainState } from 'src/store/main.store';
import { PlayerService } from './player.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Injectable({
  providedIn: 'root',
})
export class PushNotificationsService {
  public token!: string;
  public tokenChanged$ = new Subject<string>();
  public grantedPermission = false;
  public toastService = inject(ToastrService);
  private store = inject(Store);
  private playerService = inject(PlayerService);

  constructor() {
    combineLatest([this.getLoggedPlayer(), this.tokenChanged$])
      .pipe(
        tap(([, token]) =>
          firstValueFrom(this.playerService.updateFCMToken(token))
        )
      )
      .subscribe();
  }

  private getLoggedPlayer() {
    return this.store.select(MainState.getState).pipe(
      map((state) => {
        return state.player;
      }),
      filter((player) => !!player),
      tap(() => this.getToken()),
      debounceTime(300),
      distinctUntilChanged((previous, current) => previous.id == current.id)
    );
  }

  public checkPermissionIsGranted() {
    return from(FirebaseMessaging.checkPermissions()).pipe(
      map((status) => status.receive == 'granted')
    );
  }

  public async autoGetToken() {
    await firstValueFrom(
      this.checkPermissionIsGranted().pipe(
        switchMap((granted) => {
          if (granted) return of(true);
          return from(this.requestPermissions());
        })
      )
    );

    this.token = await this.getToken();
  }

  public init() {
    FirebaseMessaging.addListener('notificationReceived', (event) => {
      console.log('notificationReceived: ', { event });
    });
    FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
      console.log('notificationActionPerformed: ', { event });
    });
    if (Capacitor.getPlatform() === 'web') {
      navigator.serviceWorker.addEventListener('message', (event: any) => {
        console.log('serviceWorker message: ', { event });
        const notification = new Notification(event.data.notification.title, {
          body: event.data.notification.body,
        });
        notification.onclick = (event) => {
          console.log('notification clicked: ', { event });
        };
      });
    }
    this.autoGetToken();
  }

  public async requestPermissions(): Promise<void> {
    await FirebaseMessaging.requestPermissions();
  }

  public async getToken(): Promise<string> {
    try {
      const options: GetTokenOptions = {
        vapidKey: environment.firebase.vapidKey,
      };
      if (Capacitor.getPlatform() === 'web') {
        options.serviceWorkerRegistration =
          await navigator.serviceWorker.register('firebase-messaging-sw.js');
      }
      const { token } = await FirebaseMessaging.getToken(options);
      this.grantedPermission = true;
      this.tokenChanged$.next(token);
      return token;
    } catch (error: any) {
      this.toastService.error(error);
      return null;
    }
  }
}
