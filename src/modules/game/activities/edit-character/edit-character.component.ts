import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { PlayerService } from 'src/services/player.service';
import { PushNotificationsService } from 'src/services/push-notifications.service';
import { ViewportService } from 'src/services/viewport.service';
import { LoginPlayer, MainState, RefreshPlayer } from 'src/store/main.store';

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
    this.form = this.formBuilder.group({
      image: ['assets/free-portraits/knight.webp', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });
    if (this.editing) {
      this.load();
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
    const { email, name, image } = this.form.value;

    this.playerService
      .create(email, name, image)
      .pipe(take(1))
      .subscribe(() => {
        this.store.dispatch(new LoginPlayer());
      });
  }

  edit() {
    const { email, name, image } = this.form.value;
    this.playerService
      .update(email, name, image)
      .pipe(take(1))
      .subscribe(() => {
        this.toastService.success('Settings updated');
        this.store.dispatch(new RefreshPlayer());
      });
  }
}
