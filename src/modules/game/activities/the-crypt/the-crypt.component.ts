import {
  Component,
  effect,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
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
import { CryptService } from 'src/services/crypt.service';
import { QuestService } from 'src/services/quest.service';

@Component({
  selector: 'app-the-crypt',
  templateUrl: './the-crypt.component.html',
  styleUrl: './the-crypt.component.scss',
})
export class TheCryptComponent extends TemplatePage {
  cryptStatusEnum = CryptStatusEnum;
  cryptService = inject(CryptService);
  questService = inject(QuestService);
  toast = inject(ToastrService);
  cryptRouter = signal<CryptRouterModel>({
    status: CryptStatusEnum.IN_PROGRESS,
  });
  public currentCrypt = signal<CryptModel>(null);
  @Output() statusChanged = new EventEmitter<CryptRouterModel>();

  constructor() {
    super();
    effect(() => {
      this.statusChanged.emit(this.cryptRouter());
    });
    effect(
      () => {
        const cryptData = this.currentCrypt();
        //Aqui calcular el status de la crypta (cryptoStatusEnum)
        if (cryptData && cryptData.status != CryptStatus.STARTING) {
          console.warn('Crypt Data:', cryptData);

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
  }

  public refresh() {
    this.getCurrentCrypt();
  }

  private async getCurrentCrypt() {
    await this.questService.updateStore();
    const res = await firstValueFrom(this.cryptService.getCurrent());
    this.currentCrypt.set(res);
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

  onFightResolved(data: FightResultModel) {
    // Avanzar al resultado del combate
    this.cryptRouter.set({ status: CryptStatusEnum.RESULT, data });
  }
}
