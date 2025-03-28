import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Memoize } from 'lodash-decorators';
import { EmojiIdentifier } from 'src/modules/core/models/player.model';
import { getEmojiImageUrl } from 'src/modules/utils';
import { PlayerService } from 'src/services/player.service';
import { WebSocketService } from 'src/services/websocket.service';

@Component({
  selector: 'app-emoji-selector',
  templateUrl: './emoji-selector.component.html',
  styleUrl: './emoji-selector.component.scss'
})
export class EmojiSelectorComponent {
  @Input() fightId: string;
  @Output() emojiSelected = new EventEmitter<string>();

  showSelector = false;
  unlockedEmojis: EmojiIdentifier[] = [];

  constructor(private playerService: PlayerService, private webSocketService: WebSocketService) { }

  ngOnInit() {
    this.unlockedEmojis = this.playerService.getUnlockedEmojis();
  }

  toggleSelector() {
    this.showSelector = !this.showSelector;
  }

  selectEmoji(emojiId: EmojiIdentifier) {
    this.webSocketService.sendFightEmoji(emojiId, this.fightId);
    this.emojiSelected.emit(emojiId);
    this.showSelector = false;
  }

  @Memoize()
  getEmojiImageUrl(emojiId: EmojiIdentifier): string {
    return getEmojiImageUrl(emojiId);
  }
}
