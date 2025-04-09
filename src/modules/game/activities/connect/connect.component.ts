import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, tap } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { Realm } from 'src/modules/core/models/session.model';
import { AuthService } from 'src/services/auth.service';
import { SessionService } from 'src/services/session.service';
import { ViewportService } from 'src/services/viewport.service';
import { WalletService } from 'src/services/wallet.service';
import { LoginPlayer, MainState } from 'src/store/main.store';
import { passwordPattern } from '../edit-character/edit-character.component';
import { ThreePortalService } from './service/three-portal.service';
@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
})
export class ConnectComponent
  extends TemplatePage
  implements OnInit, AfterViewInit {
  @ViewChild('threeContainer', { static: true })
  threeContainer!: ElementRef<HTMLDivElement>;
  public prefix = ViewportService.getPreffixImg();
  walletService = inject(WalletService);
  authService = inject(AuthService);
  toast = inject(ToastrService);
  store = inject(Store);
  router = inject(Router);
  fb = inject(FormBuilder);
  threeService = inject(ThreePortalService);
  activatedRoute = inject(ActivatedRoute);
  seesionService = inject(SessionService);
  public doingLoginWithWeb2 = false;
  public recoveringPassword = false;
  public showingRealms = false;
  public formGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  public recoverPasswordFormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  public newPasswordFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(passwordPattern),
  ]);
  public isRecoveringPassword = false;
  public token!: string;
  public realms$ = this.seesionService
    .getRealms()
    .pipe(tap((e) => (this.lastLoadedRealms = e)));
  public lastLoadedRealms: Array<Realm> = [];
  public selectedRealm: Realm;
  async ngOnInit() {
    this.token = this.activatedRoute.snapshot.queryParams['token'];

    this.isRecoveringPassword =
      this.activatedRoute.snapshot.data['resetPassword'] == true &&
      !!this.token;

    const player = this.store.selectSnapshot(MainState.getState).player;
    if (player) {
      this.router.navigateByUrl('/inventory');
    }
    await firstValueFrom(this.realms$);
    const urlParams = new URLSearchParams(window.location.search);
    const realmParam = urlParams.get('realm');

    if (realmParam) {
      const existingRealm = this.lastLoadedRealms.find(
        (e) => e.id == realmParam
      );
      if (this.lastLoadedRealms.find((e) => e.id == realmParam)) {
        await Preferences.set({ key: 'selectedRealm', value: realmParam });
        this.selectedRealm = existingRealm;
      } else {
        console.log('realm ' + realmParam + ' does not exist');
      }
    } else {
      this.selectedRealm = await this.getRealmFromPreferences();
    }
  }

  private async getRealmFromPreferences(): Promise<Realm> {
    const selectedRealmRes = await Preferences.get({ key: 'selectedRealm' });
    const selectedRealm = selectedRealmRes.value;
    return this.lastLoadedRealms.find((e) => e.id == selectedRealm);
  }

  public async handleEnterRealms() {
    if (this.authService.nativePlatform) {
      this.router.navigateByUrl('/create');
      return;
    }
    const selectedRealm = await this.getRealmFromPreferences();
    if (!!selectedRealm) {
      this.walletService.modal.open();
    } else {
      this.showingRealms = true;
    }
  }

  public async handleSelectedRealm(realm: Realm) {
    await Preferences.set({
      key: 'selectedRealm',
      value: JSON.stringify(realm),
    });
    // Construir la URL con el query parameter
    const realmUrl = new URL(realm.url);
    realmUrl.searchParams.set('realm', realm.id);

    // Redirigir al URL con los query params
    window.location.href = realmUrl.toString();
  }

  ngAfterViewInit(): void {
    this.threeService.initialize(this.threeContainer);
  }

  public async doLogin() {
    this.store.dispatch(
      new LoginPlayer({
        email: this.formGroup.value.email,
        password: this.formGroup.value.password,
      })
    );
  }

  public async sendLinkRecoverPassword() {
    try {
      const res = await firstValueFrom(
        this.authService.requestPasswordReset(
          this.recoverPasswordFormGroup.value.email
        )
      );
      this.toast.success(
        'You will receive an email in the next minutes containing next steps!',
        'So far so good!'
      );
      this.formGroup.reset();
      this.recoverPasswordFormGroup.reset();
      this.doingLoginWithWeb2 = false;
      this.recoveringPassword = false;
    } catch (error: any) {
      this.toast.error(
        error?.message?.message ??
        'An error occured while trying to recover your password'
      );
    }
  }

  public async saveNewPassword() {
    try {
      const res = await firstValueFrom(
        this.authService.resetPassword(
          this.token,
          this.newPasswordFormControl.value
        )
      );
      this.toast.success('Password changed correctly!', 'You are all set!');
      this.formGroup.reset();
      this.newPasswordFormControl.reset();
      this.doingLoginWithWeb2 = false;
      this.recoveringPassword = false;
      this.isRecoveringPassword = false;
    } catch (error: any) {
      this.toast.error(
        error?.message?.message ??
        'An error occured while trying to set your new password'
      );
    }
  }

  public getRealmsByStatus(status: 'mainnet' | 'testnet'): Array<Realm> {
    return this.lastLoadedRealms.filter(realm => realm.status === status);
  }

}
