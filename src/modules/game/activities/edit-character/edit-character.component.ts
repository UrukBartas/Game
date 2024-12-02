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
import { environment } from 'src/environments/environment';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import {
  PlayerClass,
  PlayerConfiguration,
  PlayerModel,
} from 'src/modules/core/models/player.model';
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
import { ClassSelectorComponent } from './components/character-selector/character-selector.component';

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
export const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;
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
  imagePrefix = environment.permaLinkImgPref;
  PlayerClass = PlayerClass;

  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService
  ) {
    super();
    const currentRoute = this.route.snapshot.url.join('/');
    this.editing = currentRoute.includes('edit');

    this.form = this.formBuilder.group(
      {
        image: ['/assets/free-portraits/warlock.webp', [Validators.required]],
        clazz: [PlayerClass.WARLOCK, [Validators.required]],
        name: [
          '',
          this.editing
            ? []
            : [
                Validators.required,
                Validators.maxLength(20),
                Validators.minLength(3),
              ],
        ],
        email: [
          '',
          [Validators.required, Validators.email, Validators.maxLength(100)],
        ],
        password: [
          '',
          this.editing
            ? []
            : [Validators.required, Validators.pattern(passwordPattern)],
        ],
        repeatPassword: ['', this.editing ? [] : [Validators.required]],
        disablePVP: [false, []],
        disableSound: [false, []],
        disableEmailNotifications: [false, []],
        ignoreMine: [false, []],
      },
      this.editing ? {} : { validator: passwordMatchingValidator() }
    );

    if (this.editing) {
      this.loadPlayer();
    }
  }

  public getClassBackground(className: PlayerClass) {
    switch (className) {
      case PlayerClass.WARLOCK:
        return '/assets/free-portraits/backgrounds/warlock.webp';
      case PlayerClass.MAGE:
        return '/assets/free-portraits/backgrounds/mage.webp';
      case PlayerClass.ROGUE:
        return '/assets/free-portraits/backgrounds/rogue.webp';
      case PlayerClass.WARRIOR:
        return '/assets/free-portraits/backgrounds/warrior.webp';
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
    const player = this.store.selectSnapshot(
      MainState.getPlayer
    ) as PlayerModel;
    const config: ModalOptions = {
      initialState: {
        pickClass: (selectedClass, selectedSkin) => {
          if (selectedClass) {
            this.form.patchValue({
              image: selectedClass.img,
              clazz: selectedClass.clazz,
            });
            if (this.editing) {
              this.playerService
                .updateClass(selectedClass.clazz, selectedSkin.id)
                .pipe(take(1))
                .subscribe((player) => {
                  this.store.dispatch(new RefreshPlayer());
                });
            }
          }
          modalRef.hide();
        },
        selectedClass: player?.clazz,
        _selectedSkin: player?.activeSkin,
        showSelectSkin: this.editing,
        ownedSkins: player?.unlockedPortraitsIds,
      },
    };
    const modalRef = this.modalService.show(ClassSelectorComponent, config);
  }

  private async loadPlayer() {
    const player = this.store.selectSnapshot(MainState.getState).player;
    if (player) {
      const { image, clazz, name, email, configuration } = player;
      this.form.patchValue({
        image,
        clazz,
        name,
        email,
        disablePVP: configuration?.disablePVP,
        disableSound: configuration?.disableSound,
        disableEmailNotifications: configuration?.disableEmailNotifications,
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
      clazz,
      image,
      password,
      disablePVP,
      disableSound,
      disableEmailNotifications,
      ignoreMine,
    } = this.form.value;
    const configuration: PlayerConfiguration = {
      disablePVP,
      disableSound,
      disableEmailNotifications,
      ignoreMine,
    };
    const state = this.store.selectSnapshot(MainState.getState);
    if (this.authService.nativePlatform || !state.web3) {
      this.playerService
        .createByEmail(email, name, clazz, image, password, configuration)
        .pipe(take(1))
        .subscribe(() => {
          this.store.dispatch(new LoginPlayer({ email, password }));
        });
    } else {
      this.playerService
        .create(email, name, clazz, image, password, configuration)
        .pipe(take(1))
        .subscribe(() => {
          this.store.dispatch(new LoginPlayer());
        });
    }
  }

  edit() {
    const {
      email,
      password,
      disablePVP,
      disableSound,
      disableEmailNotifications,
      ignoreMine,
    } = this.form.value;
    const configuration: PlayerConfiguration = {
      disablePVP,
      disableSound,
      disableEmailNotifications,
      ignoreMine,
    };

    this.playerService
      .update(email, password, configuration)
      .pipe(take(1))
      .subscribe(() => {
        this.toastService.success('Settings updated');
        this.store.dispatch(new RefreshPlayer());
      });
  }
}
