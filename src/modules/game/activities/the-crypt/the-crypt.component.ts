import {
  Component,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngxs/store';
import { cloneDeep } from 'lodash';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, map, tap } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import {
  CryptEncounterModel,
  CryptModel,
  CryptRouterModel,
  CryptStatus,
  CryptStatusEnum,
  EncounterStatus,
} from 'src/modules/core/models/crypt.model';
import { FightResultModel } from 'src/modules/core/models/fight.model';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { CryptService } from 'src/services/crypt.service';
import { PlayerService } from 'src/services/player.service';
import { QuestService } from 'src/services/quest.service';
import { MainState, RefreshPlayer } from 'src/store/main.store';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm.modal.component';
import { CryptThreejsServiceTsService } from './services/crypt-threejs.service.ts.service';

@Component({
  selector: 'app-the-crypt',
  templateUrl: './the-crypt.component.html',
  styleUrl: './the-crypt.component.scss',
})
export class TheCryptComponent extends TemplatePage {
  cryptStatusEnum = CryptStatusEnum;
  cryptService = inject(CryptService);
  questService = inject(QuestService);
  playerService = inject(PlayerService);

  toast = inject(ToastrService);
  cryptRouter = signal<CryptRouterModel>({
    status: CryptStatusEnum.IN_PROGRESS,
  });
  public currentCrypt = signal<CryptModel>(null);
  private threeService = inject(CryptThreejsServiceTsService);
  store = inject(Store);
  public lastLoadedPlayer: PlayerModel;
  private player$ = this.store.select(MainState.getState).pipe(
    map((entry) => cloneDeep(entry.player)),
    tap((e) => (this.lastLoadedPlayer = e))
  );
  @Output() statusChanged = new EventEmitter<CryptRouterModel>();
  @ViewChild('threeContainer', { static: true })
  threeContainer!: ElementRef<HTMLDivElement>;
  public getCurrentLevel = CryptService.getCurrentLevel;
  constructor(protected modalService: BsModalService) {
    super();
    effect(() => {
      this.statusChanged.emit(this.cryptRouter());
    });
    effect(
      () => {
        const cryptData = this.currentCrypt();
        //Aqui calcular el status de la crypta (cryptoStatusEnum)
        if (cryptData && cryptData.status != CryptStatus.STARTING) {

          const newStatus = this.calculateCryptStatus(cryptData);

          // Actualizar el estado del enrutador de la cripta
          this.cryptRouter.set({ status: newStatus });
        } else {
          this.cryptRouter.set({ status: CryptStatusEnum.STARTING });
        }
      },
      { allowSignalWrites: true }
    );
    this.getCurrentCrypt();
    this.player$.pipe(takeUntilDestroyed()).subscribe();
  }

  public refresh() {
    this.getCurrentCrypt();
  }

  private async getCurrentCrypt() {
    await this.questService.updateStore();
    const res = await firstValueFrom(this.cryptService.getCurrent());
    this.currentCrypt.set(res);
    this.store.dispatch(new RefreshPlayer());
  }

  private calculateCryptStatus(cryptData: CryptModel): CryptStatusEnum {
    const { status, encounters } = cryptData;

    // Estado global de la cripta
    if (status === CryptStatus.COMPLETED) {
      return CryptStatusEnum.FINISHED;
    }
    if (status === CryptStatus.FAILED) {
      return CryptStatusEnum.FAILED;
    }

    if (status == CryptStatus.PICKING_REWARDS) {
      return CryptStatusEnum.PICKING_REWARD;
    }

    // Verificar encuentros en estado FIGHTING
    const fightingEncounter = encounters.find(
      (encounter) => encounter.status === EncounterStatus.FIGHTING
    );
    if (fightingEncounter) {
      return CryptStatusEnum.FIGHT; // El jugador está en un encuentro activo
    }

    // Verificar encuentros pendientes
    const pendingEncounters = encounters.filter(
      (encounter) => encounter.status === EncounterStatus.PENDING
    );
    if (pendingEncounters.length > 0) {
      return CryptStatusEnum.IN_PROGRESS; // Todavía hay encuentros por iniciar
    }

    // // Verificar si todos los encuentros están completados
    // const allEncountersCompleted = encounters.every(
    //   (encounter) => encounter.status === EncounterStatus.COMPLETED
    // );
    // if (allEncountersCompleted) {
    //   return CryptStatusEnum.PICKING_REWARD; // El jugador está eligiendo recompensa
    // }

    // Estado por defecto: Progresando
    return CryptStatusEnum.IN_PROGRESS;
  }

  public async startEncounter(encounter: CryptEncounterModel) {
    try {
      await firstValueFrom(
        this.cryptService.startEncounter(encounter.cryptId, encounter.id)
      );
      await this.getCurrentCrypt();
    } catch (error) {
      await this.getCurrentCrypt();
    }
  }

  async onRewardChosen(reward: any) {
    try {
      await firstValueFrom(
        this.cryptService.chooseReward(this.currentCrypt().id, reward)
      );
      await this.getCurrentCrypt();
    } catch (error) {
      await this.getCurrentCrypt();
    }
  }

  public async onStartExistingCrypt() {
    try {
      await firstValueFrom(
        this.cryptService.startExistingCrypt(this.currentCrypt().id)
      );
      await this.getCurrentCrypt();
    } catch (error) {
      await this.getCurrentCrypt();
    }
  }

  public async onCryptStart() {
    try {
      await firstValueFrom(this.cryptService.start());
      await this.getCurrentCrypt();
    } catch (error) {
      await this.getCurrentCrypt();
    }
  }

  public async onCryptSurrender() {
    try {
      await firstValueFrom(
        this.cryptService.endCrypt(this.currentCrypt().id, CryptStatus.FAILED)
      );
      await this.getCurrentCrypt();
    } catch (error) {
      await this.getCurrentCrypt();
    }
  }

  public async takeShortBreak() {
    try {
      await firstValueFrom(
        this.cryptService
          .takeShortBreak(this.currentCrypt().id)
          .pipe(tap((e) => this.toast.info(e.result)))
      );
      await this.getCurrentCrypt();
    } catch (error) {
      await this.getCurrentCrypt();
    }
  }

  public async getMoreTries() {
    const price = await firstValueFrom(
      this.playerService.getExtraAttemptPrice()
    );
    const config: ModalOptions = {
      initialState: {
        title: 'Try again?',
        description: `You are about to purchase an extra attempt for ${price} Golden Uruks, do you want to continue?`,
        accept: async () => {
          try {
            await firstValueFrom(this.cryptService.purchaseOneMoreTry());
            await this.getCurrentCrypt();
            this.toast.success('You got one more try... use it wisely');
          } catch (error) {
            await this.getCurrentCrypt();
          }
          modalRef.hide();
        },
      },
    };
    const modalRef = this.modalService.show(ConfirmModalComponent, config);
  }

  onFightResolved(data: FightResultModel) {
    // Avanzar al resultado del combate
    this.cryptRouter.set({ status: CryptStatusEnum.RESULT, data });
  }

  ngOnInit(): void {
    this.threeService.initialize(this.threeContainer, parseInt('ced4d2', 16));
  }
}
