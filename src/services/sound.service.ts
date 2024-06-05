import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private audio: HTMLAudioElement;

  constructor() {
    this.audio = new Audio();
  }

  playSound(url: string): void {
    this.audio.src = url;
    this.audio.load();
    this.audio.play();
  }
}
