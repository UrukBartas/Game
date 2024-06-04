import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Store } from '@ngxs/store';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { AuthService } from 'src/services/auth.service';
import { WalletService } from 'src/services/wallet.service';
import { LoginPlayer, MainState } from 'src/store/main.store';
import { Location } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
})
export class ConnectComponent extends TemplatePage implements OnInit {
  walletService = inject(WalletService);
  authService = inject(AuthService);
  toast = inject(ToastrService);
  store = inject(Store);
  router = inject(Router);
  fb = inject(FormBuilder);

  public doingLogin = false;
  public formGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    const player = this.store.selectSnapshot(MainState.getState).player;
    if (player) {
      this.router.navigateByUrl('/inventory');
    }
  }

  public async doLogin() {
    this.store.dispatch(
      new LoginPlayer({
        email: this.formGroup.value.email,
        password: this.formGroup.value.password,
      })
    );
  }
}
