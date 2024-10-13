import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { AuthService } from 'src/services/auth.service';
import { WalletService } from 'src/services/wallet.service';
import { LoginPlayer, MainState } from 'src/store/main.store';
import { ThreePortalService } from './service/three-portal.service';
@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
})
export class ConnectComponent
  extends TemplatePage
  implements OnInit, AfterViewInit
{
  @ViewChild('threeContainer', { static: true })
  threeContainer!: ElementRef<HTMLDivElement>;
  public prefix = environment.permaLinkImgPref;
  walletService = inject(WalletService);
  authService = inject(AuthService);
  toast = inject(ToastrService);
  store = inject(Store);
  router = inject(Router);
  fb = inject(FormBuilder);
  threeService = inject(ThreePortalService);
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
}
