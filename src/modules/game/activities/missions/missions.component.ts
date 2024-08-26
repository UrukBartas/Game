import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TemplatePage } from 'src/modules/core/components/template-page.component';

@Component({
  selector: 'app-missions',
  templateUrl: './missions.component.html',
  styleUrl: './missions.component.scss',
})
export class MissionsComponent extends TemplatePage {
  router = inject(Router);
}
