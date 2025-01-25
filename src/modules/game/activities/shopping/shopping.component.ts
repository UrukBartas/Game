import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TemplatePage } from 'src/modules/core/components/template-page.component';

@Component({
  selector: 'app-shopping',
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.scss',
})
export class ShoppingComponent extends TemplatePage {
  router = inject(Router);
}
