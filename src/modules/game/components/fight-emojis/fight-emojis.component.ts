import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Memoize } from 'lodash-decorators';
import { Subscription } from 'rxjs';
import { EmojiIdentifier, FightEmoji } from 'src/modules/core/models/player.model';
import { getEmojiImageUrl } from 'src/modules/utils';
import { WebSocketService } from 'src/services/websocket.service';
import { MainState } from 'src/store/main.store';

@Component({
  selector: 'app-fight-emojis',
  templateUrl: './fight-emojis.component.html',
  styleUrls: ['./fight-emojis.component.scss']
})
export class FightEmojisComponent implements OnInit, OnDestroy {
  @Input() fightId: string;
  @Input() emitterName: string; // Nombre del emisor (jugador o enemigo)

  emojis: FightEmoji[] = [];
  private subscription: Subscription;
  currentPlayerId: string;
  private emojiTimeouts: Map<string, any> = new Map();

  constructor(private webSocketService: WebSocketService, private store: Store) { }

  async ngOnInit() {
    this.currentPlayerId = (await this.store.selectSnapshot(MainState.getPlayer)).id;

    this.subscription = this.webSocketService.fightEmojis$.subscribe(emoji => {
      // Verificar que el emoji pertenece a este combate y a este emisor
      if (emoji.fightId === this.fightId && emoji.senderName === this.emitterName) {
        // Limpiar cualquier timeout existente para este remitente
        if (this.emojiTimeouts.has(emoji.senderId)) {
          clearTimeout(this.emojiTimeouts.get(emoji.senderId));
        }

        // Actualizar o agregar el emoji
        this.emojis = this.emojis.filter(e => e.senderId !== emoji.senderId);
        this.emojis.push(emoji);

        // Configurar un nuevo timeout para eliminar el emoji después de 3 segundos
        const timeout = setTimeout(() => {
          this.emojis = this.emojis.filter(e => e.senderId !== emoji.senderId);
          this.emojiTimeouts.delete(emoji.senderId);
        }, 3000);

        this.emojiTimeouts.set(emoji.senderId, timeout);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Limpiar todos los timeouts pendientes
    this.emojiTimeouts.forEach(timeout => clearTimeout(timeout));
    this.emojiTimeouts.clear();
  }

  @Memoize()
  getEmojiImageUrl(emojiId: string): string {
    return getEmojiImageUrl(emojiId as EmojiIdentifier);
  }
}
