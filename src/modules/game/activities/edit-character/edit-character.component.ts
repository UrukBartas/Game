import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { getAccount } from '@wagmi/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, take } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { PlayerConfiguration } from 'src/modules/core/models/player.model';
import { truncateEthereumAddress } from 'src/modules/utils';
import { AuthService } from 'src/services/auth.service';
import { MiscellanyService } from 'src/services/miscellany.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { WalletService } from 'src/services/wallet.service';
import {
  DisconnectWallet,
  LoginPlayer,
  MainState,
  RefreshPlayer,
} from 'src/store/main.store';
import { CharacterSelectorComponent } from './components/character-selector/character-selector.component';

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
  miscService = inject(MiscellanyService);
  store = inject(Store);
  formBuilder = inject(FormBuilder);
  toastService = inject(ToastrService);
  authService = inject(AuthService);
  router = inject(Router);
  location = inject(Location);
  walletService = inject(WalletService);
  editing = false;
  form: FormGroup;
  truncateAddress = truncateEthereumAddress;

  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService
  ) {
    super();
    const currentRoute = this.route.snapshot.url.join('/');
    this.editing = currentRoute.includes('edit');
    const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;

    this.form = this.formBuilder.group(
      {
        image: ['assets/free-portraits/warlock.webp', [Validators.required]],
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          this.editing
            ? []
            : [Validators.required, Validators.pattern(passwordPattern)],
        ],
        repeatPassword: ['', this.editing ? [] : [Validators.required]],
        disablePVP: [false, []],
        disableSound: [false, []],
        ignoreMine: [false, []],
      },
      this.editing ? {} : { validator: passwordMatchingValidator() }
    );

    if (this.editing) {
      this.loadPlayer();
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

  public openCharacterSelector() {
    const config: ModalOptions = {
      initialState: {
        accept: (image: string) => {
          if (image) {
            this.form.patchValue({ image });
          }
          modalRef.hide();
        },
      },
    };
    const modalRef = this.modalService.show(CharacterSelectorComponent, config);
  }

  private async loadPlayer() {
    const player = this.store.selectSnapshot(MainState.getState).player;
    if (player) {
      const { image, name, email, configuration } = player;
      this.form.patchValue({
        image,
        name,
        email,
        disablePVP: configuration?.disablePVP,
        disableSound: configuration?.disableSound,
        ignoreMine: configuration?.ignoreMine,
      });
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
    const {
      email,
      name,
      image,
      password,
      disablePVP,
      disableSound,
      ignoreMine,
    } = this.form.value;
    const configuration: PlayerConfiguration = {
      disablePVP,
      disableSound,
      ignoreMine,
    };

    if (this.authService.nativePlatform) {
      this.playerService
        .createByEmail(email, name, image, password, configuration)
        .pipe(take(1))
        .subscribe(() => {
          this.store.dispatch(new LoginPlayer({ email, password }));
        });
    } else {
      this.playerService
        .create(email, name, image, password, configuration)
        .pipe(take(1))
        .subscribe(() => {
          this.store.dispatch(new LoginPlayer());
        });
    }
  }

  edit() {
    const {
      email,
      name,
      image,
      password,
      disablePVP,
      disableSound,
      ignoreMine,
    } = this.form.value;
    const configuration: PlayerConfiguration = {
      disablePVP,
      disableSound,
      ignoreMine,
    };

    this.playerService
      .update(email, name, image, password, configuration)
      .pipe(take(1))
      .subscribe(() => {
        this.toastService.success('Settings updated');
        this.store.dispatch(new RefreshPlayer());
      });
  }
}
