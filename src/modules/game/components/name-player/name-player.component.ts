import { Component, inject, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { AuthService } from 'src/services/auth.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm.modal.component';

@Component({
  selector: 'app-name-player',
  templateUrl: './name-player.component.html',
  styleUrl: './name-player.component.scss',
})
export class NamePlayerComponent {
  @Input() player: PlayerModel;
  @Input() disabledTrigger = false;
  bsModalService = inject(BsModalService);
  authService = inject(AuthService);
  toastService = inject(ToastrService);
  public prefix = environment.permaLinkImgPref;

  public clickedIcon() {
    if (!!this.player.emailVerified || this.disabledTrigger) return;
    const ref = this.bsModalService.show(ConfirmModalComponent, {
      initialState: {
        title: 'Start Email Verification',
        description:
          'You are about to begin the email verification process. Please check your inbox and click on the verification link to complete the process. Once verified, you will earn the Verified Badge!',
        accept: async () => {
          try {
            firstValueFrom(this.authService.requestEmailVerification()).then(
              () => this.toastService.success('Mail sent! Check your inbox!')
            );
            ref.hide();
          } catch (error) {
            this.toastService.error('Some error happened, try again!');
          }
        },
      },
    });
  }
}
