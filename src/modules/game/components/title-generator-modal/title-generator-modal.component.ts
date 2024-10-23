import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { filter, firstValueFrom, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MiscellanyItemData } from 'src/modules/core/models/misc.model';
import { MiscellanyService } from 'src/services/miscellany.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';

@Component({
  selector: 'app-title-generator-modal',
  templateUrl: './title-generator-modal.component.html',
  styleUrl: './title-generator-modal.component.scss',
})
export class TitleGeneratorModalComponent {
  modalRef = inject(BsModalRef);
  router = inject(Router);
  store = inject(Store);
  miscService = inject(MiscellanyService);
  public prefix = environment.permaLinkImgPref;
  public player$ = this.store.select(MainState.getState).pipe(
    filter((player) => !!player),
    map((player) => player.player)
  );

  public onlyPrefix(titles: MiscellanyItemData[]) {
    return titles.filter((title) => title.itemType == 'Title_Prefix');
  }

  public onlySuffix(titles: MiscellanyItemData[]) {
    return titles.filter((title) => title.itemType == 'Title_Suffix');
  }

  public async activateTitle(title: MiscellanyItemData) {
    const res = await firstValueFrom(
      this.miscService.setTitle(title.itemType as any, title.id)
    );
    this.store.dispatch(new RefreshPlayer());
  }
}
