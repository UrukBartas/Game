import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Observable, finalize, firstValueFrom, tap } from 'rxjs';
import { Consumable } from 'src/modules/core/models/consumable.model';
import { Material } from 'src/modules/core/models/material.model';
import {
  MiscellanyItem,
  MiscellanyItemIdentifier,
} from 'src/modules/core/models/misc.model';
import {
  EmojiIdentifier,
  ItemSet,
  PlayerClass,
  PlayerConfiguration,
  PlayerModel,
} from 'src/modules/core/models/player.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
import { LeaderboardType } from 'src/modules/game/activities/leadeboard/enum/leaderboard-type.enum';
import { ConfirmModalComponent } from 'src/modules/game/components/confirm-modal/confirm.modal.component';
import { MainState, RefreshPlayer } from 'src/store/main.store';
import { AuthService } from './auth.service';
import { ItemService } from './item.service';
type LeaderboardPlayer = PlayerModel & { winCount: number };
@Injectable({
  providedIn: 'root',
})
export class PlayerService extends ApiBaseService {
  constructor(
    private http: HttpClient,
    private itemService: ItemService,
    private authService: AuthService,
    private toastService: ToastrService,
    private modalService: BsModalService
  ) {
    super(http);
    this.controllerPrefix = '/player';
  }

  // Método para obtener los emojis desbloqueados del jugador
  getUnlockedEmojis(): EmojiIdentifier[] {
    const player = this.store.selectSnapshot(MainState.getPlayer);
    return player.unlockedEmojis || [
      EmojiIdentifier.EMOJI_THUMBS_UP,
      EmojiIdentifier.EMOJI_THUMBS_DOWN,
      EmojiIdentifier.EMOJI_SMILE,
      EmojiIdentifier.EMOJI_SAD,
      EmojiIdentifier.EMOJI_ANGRY
    ];
  }

  public startEmailVerification() {
    const player = this.store.selectSnapshot(MainState.getState).player;
    const ref = this.modalService.show(ConfirmModalComponent, {
      initialState: {
        title: 'Start Email Verification',
        description:
          `You are about to begin the verification process for the email: ${player.email}.\n\n Please check your inbox and click on the verification link to complete the process. Once verified, you will earn the Verified Badge!`,
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

  public getExtraAttemptPrice(): Observable<number> {
    return this.get('/crypt-attempt-price');
  }

  public getUpgradeCost(): Observable<{ cost: number }> {
    return this.get(`/cost`);
  }

  public getMultichainStakedAmount$(): Observable<number> {
    return this.get('/get-multichain-staked-amount');
  }

  public upgradeStat(stat: string): Observable<PlayerModel> {
    return this.post(`/upgrade/${stat}`, {});
  }

  public getPlayerDeeds(): Observable<{
    playerDeeds: Array<any>;
    allDeeds: Array<any>;
  }> {
    return this.get('/deeds');
  }

  public async equipItemFlow(equip$: Observable<any>, onEquip?: Function) {
    this.spinnerService.show();
    await firstValueFrom(
      equip$.pipe(
        tap(() => {
          this.store.dispatch(new RefreshPlayer());
          onEquip();
        }),
        finalize(() => {
          this.spinnerService.hide();
        })
      )
    );
  }

  create(
    email: string,
    name: string,
    clazz: PlayerClass,
    image: string,
    password: string,
    configuration: PlayerConfiguration,
    referralCode?: string
  ): Observable<PlayerModel> {
    return this.post('/create', {
      email,
      name,
      clazz,
      image,
      password,
      configuration,
      referralCode,
    });
  }

  createByEmail(
    email: string,
    name: string,
    clazz: PlayerClass,
    image: string,
    password: string,
    configuration: PlayerConfiguration,
    referralCode?: string
  ): Observable<PlayerModel> {
    return this.post('/create-by-email', {
      email,
      name,
      clazz,
      image,
      password,
      configuration,
      referralCode,
    });
  }

  update(
    email: string,
    password: string,
    configuration: PlayerConfiguration
  ): Observable<PlayerModel> {
    return this.post('/update', {
      email,
      password,
      configuration,
    });
  }

  updateClass(clazz: PlayerClass, skin: MiscellanyItemIdentifier) {
    return this.post('/update-class', {
      clazz,
      skin,
    });
  }

  migrateEta(address: string) {
    return this.get('/migrate-eta-account/' + address);
  }

  getItems() {
    return this.get('/inventory');
  }

  getItemsSize() {
    return this.get('/inventory-size');
  }

  getItemsConsumable(): Observable<Array<Consumable>> {
    return this.get('/inventory-consumables');
  }

  getMiscellanyItems(): Observable<Array<MiscellanyItem>> {
    return this.get('/inventory-miscellany');
  }

  getItemsMaterial(): Observable<Array<Material>> {
    return this.get('/inventory-materials');
  }

  getItemsDisabled() {
    return this.get('/inventory-disabled');
  }

  getNFTS() {
    return this.get('/get-nfts-items', true);
  }



  public getLeaderboard(
    sortBy: string,
    sortType: 'asc' | 'desc',
    page: number,
    chunkSize: number,
    nameOrWallet: string,
    periodType: 'weekly' | 'monthly',
    leaderboardType: LeaderboardType,
    onlyOnline: boolean
  ) {
    const body = {
      sortBy,
      sortType,
      page,
      chunkSize,
      nameOrWallet,
      typeFilter: periodType,
      leaderboardType,
      onlyOnline
    }
    return this.post('/get-leaderboard/', body) as Observable<LeaderboardPlayer[]>;
  }

  public getPlayerByAddress(address: string) {
    return this.get('/by-address/' + address);
  }

  public createItemSet(name: string, itemIds: number[]): Observable<ItemSet> {
    return this.post('/item-set/create', { name, itemIds });
  }

  public getItemSets(): Observable<ItemSet[]> {
    return this.get('/item-sets');
  }

  public updateItemSet(
    setId: number,
    name: string,
    itemIds: number[]
  ): Observable<ItemSet> {
    return this.post(`/item-set/update/${setId}`, { name, itemIds });
  }

  public equipItemSet(setId: number): Observable<any> {
    return this.get('/item-set/equip/' + setId);
  }

  public deleteItemSet(setId: number) {
    return this.delete('/item-set/' + setId);
  }

  public equipMount(mountId: number) {
    return this.get('/equip-mount/' + mountId);
  }

  /**
   * Busca jugadores por nombre
   * @param query Texto para buscar en los nombres de jugadores
   * @returns Lista de jugadores que coinciden con la búsqueda
   */
  public searchPlayers(query: string): Observable<Array<{ id: string, name: string, image: string }>> {
    return this.get(`/search?query=${encodeURIComponent(query)}`);
  }
}
