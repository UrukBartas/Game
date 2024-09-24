import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { filter, firstValueFrom, map } from 'rxjs';
import { MainState } from 'src/store/main.store';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private audio: HTMLAudioElement;
  private store: Store = inject(Store);
  constructor() {
    this.audio = new Audio();
  }

  async playSound(url: string) {
    const configuration = await firstValueFrom(
      this.store.select(MainState.getState).pipe(
        filter((player) => !!player),
        map((entry) => entry.player?.configuration)
      )
    );
    if (!configuration?.disableSound) {
      this.audio.src = url;
      this.audio.load();
      this.audio.play();
    }
  }
}
