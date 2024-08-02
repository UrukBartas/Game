import { Component, SecurityContext, ViewEncapsulation, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { MarkdownComponent, provideMarkdown } from 'ngx-markdown';
import { SubtextSizeDirective } from 'src/modules/core/directives/subtext-size.directive';
import { TextSizeDirective } from 'src/modules/core/directives/text-size.directive';
import { NotificationModel } from 'src/modules/core/models/notifications.model';
import { MainState } from 'src/store/main.store';

@Component({
  selector: 'app-inbox-modal',
  standalone: true,
  imports: [TextSizeDirective, SubtextSizeDirective, MarkdownComponent],
  providers: [provideMarkdown({ sanitize: SecurityContext.NONE })],
  templateUrl: './inbox-modal.component.html',
  styleUrl: './inbox-modal.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class InboxModalComponent {
  modalRef = inject(BsModalRef);
  store = inject(Store);
  notifications = this.store.selectSnapshot(MainState.getState).notifications;
  playerId = this.store.selectSnapshot(MainState.getState).player?.id;
  openedNotification: NotificationModel;
}
