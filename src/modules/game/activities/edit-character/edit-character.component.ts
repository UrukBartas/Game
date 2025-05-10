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
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, take } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { ClassPassive } from 'src/modules/core/models/class-passive.model';
import {
  PlayerClass,
  PlayerConfiguration
} from 'src/modules/core/models/player.model';
import { getClassBackground, getStatIcon, truncateEthereumAddress } from 'src/modules/utils';
import { AuthService } from 'src/services/auth.service';
import { MiscellanyService } from 'src/services/miscellany.service';
import { PlayerService } from 'src/services/player.service';
import { ViewportService } from 'src/services/viewport.service';
import { WalletService } from 'src/services/wallet.service';
import { mapPercentLabels } from 'src/standalone/item-tooltip/item-tooltip.component';
import {
  DisconnectWallet,
  LoadClassPassives,
  LoginPlayer,
  MainState,
  RefreshPlayer,
} from 'src/store/main.store';

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
  imagePrefix = ViewportService.getPreffixImg();
  PlayerClass = PlayerClass;
  classPassives: Record<string, ClassPassive> = {};
  selectedCard: 'class' | 'credentials' | 'notifications' | 'account' | null = null;

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
        disableChatNotifications: [false, []],
        ignoreMine: [false, []],
        referralCode: ['', []],
      },
      this.editing ? {} : { validator: passwordMatchingValidator() }
    );

    if (this.editing) {
      this.loadPlayer();
    } else {
      this.form.patchValue({
        referralCode: this.route.snapshot.queryParams['referral'] ?? '',
      });
    }

    // Cargar las pasivas de clase
    this.loadClassPassives();
  }

  public getClassBackground = getClassBackground;

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

  public onClassPicked(event: { selectedClass: any, selectedSkin: any }) {
    if (event.selectedClass) {
      this.form.patchValue({
        image: event.selectedSkin.imageLocal,
        clazz: event.selectedClass.clazz,
      });
      if (this.editing) {
        this.playerService
          .updateClass(event.selectedClass.clazz, event.selectedSkin.id)
          .pipe(take(1))
          .subscribe((player) => {
            this.store.dispatch(new RefreshPlayer());
          });
      }
    }
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
        disableChatNotifications: configuration?.disableChatNotifications,
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


  // Actualizar el método save para resetear el valor inicial después de guardar
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
      disableChatNotifications,
      ignoreMine,
      referralCode,
    } = this.form.value;
    const configuration: PlayerConfiguration = {
      disablePVP,
      disableSound,
      disableEmailNotifications,
      disableChatNotifications,
      ignoreMine,
    };
    const state = this.store.selectSnapshot(MainState.getState);
    if (!state.web3) {
      this.playerService
        .createByEmail(
          email,
          name,
          clazz,
          image,
          password,
          configuration,
          referralCode
        )
        .pipe(take(1))
        .subscribe(() => {
          this.form.markAsPristine();
          this.store.dispatch(new LoginPlayer({ email, password }));
        });
    } else {
      this.playerService
        .create(
          email,
          name,
          clazz,
          image,
          password,
          configuration,
          referralCode
        )
        .pipe(take(1))
        .subscribe(() => {
          this.form.markAsPristine();
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
      disableChatNotifications,
      ignoreMine,
    } = this.form.value;
    const configuration: PlayerConfiguration = {
      disablePVP,
      disableSound,
      disableEmailNotifications,
      disableChatNotifications,
      ignoreMine,
    };

    this.playerService
      .update(email, password, configuration)
      .pipe(take(1))
      .subscribe(() => {
        this.form.markAsPristine();
        this.toastService.success('Settings updated');
        this.store.dispatch(new RefreshPlayer());
      });
  }

  public isEmailVerified() {
    const player = this.store.selectSnapshot(MainState.getState).player;
    return player?.emailVerified;
  }

  public startEmailVerification() {
    this.playerService.startEmailVerification();
  }

  private loadClassPassives() {
    const passives = this.store.selectSnapshot(MainState.getClassPassives);
    if (!passives || Object.keys(passives).length === 0) {
      this.store.dispatch(new LoadClassPassives()).subscribe(() => {
        this.classPassives = this.store.selectSnapshot(MainState.getClassPassives);
      });
    } else {
      this.classPassives = passives;
    }
  }

  public getClassPassivesForCurrentClass(): ClassPassive {
    const currentClass = this.form.value.clazz;
    return this.classPassives[currentClass];
  }

  public getStatIcon = getStatIcon;

  public getStatName(stat: string): string {
    return mapPercentLabels[stat];
  }

  public getObjectEntries(obj: any): { key: string, value: any }[] {
    if (!obj) return [];
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }

  selectCard(card: 'class' | 'credentials' | 'notifications' | 'account') {
    this.selectedCard = card;
  }

  goBack() {
    this.selectedCard = null;
  }
}
