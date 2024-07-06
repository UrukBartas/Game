import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, take } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { AuthService } from 'src/services/auth.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import {
  DisconnectWallet,
  LoginPlayer,
  MainState,
  RefreshPlayer,
} from 'src/store/main.store';
import { Location } from '@angular/common';
import { WalletService } from 'src/services/wallet.service';
import { getAccount } from '@wagmi/core';
export function passwordMatchingValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const password = control.get('password');
    const repeatPassword = control.get('repeatPassword');

    if (password && repeatPassword && password.value !== repeatPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  };
}
@Component({
  selector: 'app-edit-character',
  templateUrl: './edit-character.component.html',
  styleUrls: ['./edit-character.component.scss'],
})
export class EditCharacterComponent extends TemplatePage {
  playerService = inject(PlayerService);
  viewportService = inject(ViewportService);
  store = inject(Store);
  formBuilder = inject(FormBuilder);
  toastService = inject(ToastrService);
  authService = inject(AuthService);
  router = inject(Router);
  location = inject(Location);
  walletService = inject(WalletService);
  //public pushNotificationsService = inject(PushNotificationsService);
  images = [
    'assets/free-portraits/knight.webp',
    'assets/free-portraits/knight-f.webp',
    'assets/free-portraits/bartender.webp',
    'assets/free-portraits/bartender-f.webp',
    'assets/free-portraits/blacksmith.webp',
    'assets/free-portraits/blacksmith-f.webp',
  ];

  editing = false;
  form: FormGroup;

  constructor(private route: ActivatedRoute) {
    super();
    const currentRoute = this.route.snapshot.url.join('/');
    this.editing = currentRoute.includes('edit');
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const namePattern = /^[a-zA-Z0-9]+$/;

    this.form = this.formBuilder.group(
      {
        image: ['assets/free-portraits/knight.webp', [Validators.required]],
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern(namePattern),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [Validators.required, Validators.pattern(passwordPattern)],
        ],
        repeatPassword: ['', [Validators.required]],
      },
      { validator: passwordMatchingValidator() }
    );

    if (this.editing) {
      this.load();
    }
  }

  public userHasLinkedAddress() {
    const player = this.store.selectSnapshot(MainState.getState).player;
    return player?.id?.match(/^0x[a-fA-F0-9]{40}$/);
  }

  public getPlayerAddress() {
    const player = this.store.selectSnapshot(MainState.getState).player;
    return player.id;
  }

  public hasWalletConnected() {
    return !!getAccount().address;
  }

  public async linkWeb3WalletAddressToThisAccount() {
    if (!!this.hasWalletConnected()) {
      const isValidOwner = await firstValueFrom(
        this.walletService.verifyOwnership()
      );
      if (!!isValidOwner) {
        this.playerService
          .migrateEta(getAccount().address)
          .subscribe(() => this.store.dispatch(new DisconnectWallet()));
      } else {
        this.toastService.error('You are not the owner of this wallet!');
      }
    } else {
      this.walletService.modal.open();
    }
  }

  private async load() {
    const player = this.store.selectSnapshot(MainState.getState).player;
    if (player) {
      const { image, name, email } = player;
      this.form.patchValue({ image, name, email });
    }
  }

  public getImageContainerSizeByScreenSize() {
    switch (this.viewportService.screenSize) {
      case 'xxl':
      case 'xl':
      case 'lg':
        return 200;
      case 'md':
        return 150;
      case 'xs':
      case 'sm':
      default:
        return 100;
    }
  }

  save() {
    if (this.form.valid) {
      if (this.editing) {
        this.edit();
      } else {
        this.create();
      }
    } else {
      this.toastService.error('Please, fulfill all the fields');
    }
  }

  create() {
    const { email, name, image, password } = this.form.value;

    if (this.authService.nativePlatform) {
      this.playerService
        .createByEmail(email, name, image, password)
        .pipe(take(1))
        .subscribe(() => {
          this.store.dispatch(new LoginPlayer({ email, password }));
        });
    } else {
      this.playerService
        .create(email, name, image, password)
        .pipe(take(1))
        .subscribe(() => {
          this.store.dispatch(new LoginPlayer());
        });
    }
  }

  edit() {
    const { email, name, image, password } = this.form.value;
    this.playerService
      .update(email, name, image, password)
      .pipe(take(1))
      .subscribe(() => {
        this.toastService.success('Settings updated');
        this.store.dispatch(new RefreshPlayer());
      });
  }
}
