import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { RedirectPageTypes } from 'src/app/app-routing.module';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-redirect-page',
  templateUrl: './redirect-page.component.html',
  styleUrl: './redirect-page.component.scss',
})
export class RedirectPageComponent {
  loading = true;
  success = false;

  // Mensajes que vienen de la ruta
  loadingMessage!: string;
  successMessage!: string;
  failureMessage!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private auth: AuthService
  ) {}

  private async executeMailVerification() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      try {
        await firstValueFrom(this.auth.verifyEmail(token));
        this.success = true;
        this.toastr.success(this.successMessage);
        setTimeout(() => this.router.navigate(['/']), 3000);
      } catch (error) {
        this.success = false;
        this.toastr.error(this.failureMessage);
      }
    } else {
      this.loading = false;
      this.success = false;
      this.toastr.error(this.failureMessage);
    }
  }

  ngOnInit() {
    this.loadingMessage = this.route.snapshot.data['loadingMessage'];
    this.successMessage = this.route.snapshot.data['successMessage'];
    this.failureMessage = this.route.snapshot.data['failureMessage'];
    const type = this.route.snapshot.data['type'] as RedirectPageTypes;
    if (type == RedirectPageTypes.EMAIL) {
      this.executeMailVerification();
    }
  }
}
