import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { UserService } from 'src/services/user.service';
import { ViewportService } from 'src/services/viewport.service';
import { LoginUser, MainState, UpdateUser } from 'src/store/main.store';

@Component({
  selector: 'app-edit',
  templateUrl: './edit-character.component.html',
  styleUrls: ['./edit-character.component.scss'],
})
export class EditCharacterComponent extends TemplatePage {
  userService = inject(UserService);
  viewportService = inject(ViewportService);
  store = inject(Store);
  formBuilder = inject(FormBuilder);
  toastService = inject(ToastrService);

  images = [
    'assets/free-portraits/knight.webp',
    'assets/free-portraits/knight-f.webp',
    'assets/free-portraits/bartender.webp',
    'assets/free-portraits/bartender-f.webp',
    'assets/free-portraits/blacksmith.webp',
    'assets/free-portraits/hairdresser.webp',
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
      this.loadUser();
    }
  }

  private loadUser() {
    const user = this.store.selectSnapshot(MainState.getState).user;
    if (user) {
      const { image, name, email } = user;
      this.form.patchValue({ image, name, email });
    }
  }

  public getImageContainerSizeByScreenSize() {
    if (
      this.viewportService.screenSize == 'xs' ||
      this.viewportService.screenSize == 'sm'
    ) {
      return 100;
    }
    return 150;
  }

  saveCharacter() {
    if (this.form.valid) {
      if (this.editing) {
        this.editUser();
      } else {
        this.createUser();
      }
    } else {
      this.toastService.error('Please, fulfill all the fields');
    }
  }

  createUser() {
    const { email, name, image } = this.form.value;

    this.userService
      .createCharacter(email, name, image)
      .pipe(take(1))
      .subscribe(() => {
        this.store.dispatch(new LoginUser());
      });
  }

  editUser() {
    const { email, name, image } = this.form.value;
    this.userService
      .updateCharacter(email, name, image)
      .pipe(take(1))
      .subscribe((user) => {
        this.toastService.success('Settings updated');
        this.store.dispatch(new UpdateUser({ email, name, image }));
      });
  }
}