import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { TemplatePage } from 'src/modules/core/components/template-page.component';
import { PlayerModel } from 'src/modules/core/models/player.model';
import { getPvpTier, getQuestTier, getRarityColor } from 'src/modules/utils';
import { ReferralService } from 'src/services/referral.service';
import { ViewportService } from 'src/services/viewport.service';

interface Reward {
  id: string;
  type: 'gold' | 'item' | 'skin';
  amount?: number;
  itemId?: string;
  claimed: boolean;
  description: string;
}

@Component({
  selector: 'app-referrals',
  templateUrl: './referrals.component.html',
  styleUrl: './referrals.component.scss',
})
export class ReferralsComponent extends TemplatePage implements OnInit {
  // Código de referido del jugador actual
  referralCode: string = '';

  // Para el formulario de introducir código
  referralCodeInput: string = '';

  // Información del reclutador si existe
  recruiter: PlayerModel | null = null;

  // Lista de jugadores reclutados
  recruitedPlayers: PlayerModel[] = [];

  // Recompensas disponibles/reclamadas como reclutado
  recruitedRewards: Reward[] = [];
  getRarityColor = getRarityColor;
  // Estado de carga
  isLoading = false;

  public currentRewards$ = this.refferalsService.getCurrentRewards();
  prefix = ViewportService.getPreffixImg();
  referralUrl: string;

  constructor(
    private refferalsService: ReferralService,
    private toastr: ToastrService,
    private viewportService: ViewportService
  ) {
    super();
  }

  async ngOnInit() {
    await this.loadReferralData();
  }

  public getPvpTier(pvpIndex: number) {
    return getPvpTier(pvpIndex);
  }

  public getQuestTier(questCount: number) {
    return getQuestTier(questCount);
  }

  /**
   * Carga todos los datos relacionados con referidos
   */
  private async loadReferralData() {
    try {
      this.isLoading = true;

      // Cargar código de referido del jugador
      this.referralCode = (
        await firstValueFrom(this.refferalsService.getReferralCode())
      ).code;
      this.referralUrl = `${window.location.origin}/create?referral=${this.referralCode}`;
      console.log(this.referralUrl);
      // Cargar información del reclutador si existe
      const recruiterData = await firstValueFrom(
        this.refferalsService.getRecruiter()
      );
      this.recruiter = recruiterData || null;

      // Cargar lista de jugadores reclutados
      this.recruitedPlayers = await firstValueFrom(
        this.refferalsService.getRecruitedPlayers()
      );
    } catch (error) {
      this.toastr.error('Error loading referral data');
      console.error('Error loading referral data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Copia el código de referido al portapapeles
   */
  async copyCode() {
    try {
      await navigator.clipboard.writeText(this.referralCode);
      this.toastr.success('Referral code copied to clipboard!');
    } catch (error) {
      this.toastr.error('Failed to copy referral code');
    }
  }

  /**
   * Reclama una recompensa específica
   */
  async claimReward(reward: Reward) {
    try {
      // this.isLoading = true;
      // await this.playerService.claimReferralReward(reward.id);
      // this.toastr.success('Reward claimed successfully!');
      // await this.loadReferralData(); // Recargar datos para actualizar estado
    } catch (error) {
      this.toastr.error('Error claiming reward');
      console.error('Error claiming reward:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Genera la URL para compartir el código de referido
   */
  getReferralUrl(): string {
    return `${window.location.origin}/register?ref=${this.referralCode}`;
  }

  /**
   * Calcula el total de recompensas obtenidas como reclutador
   */
  getTotalRecruiterRewards(): number {
    return 0;
    // return this.recruitedPlayers.reduce((total, player) => {
    //   return (
    //     total +
    //     player.rewards.reduce((rewardTotal, reward) => {
    //       return rewardTotal + (reward.amount || 0);
    //     }, 0)
    //   );
    // }, 0);
  }

  /**
   * Calcula el total de recompensas obtenidas como reclutado
   */
  getTotalRecruitedRewards(): number {
    return this.recruitedRewards.reduce((total, reward) => {
      return total + (reward.amount || 0);
    }, 0);
  }

  public getPlayerImageSize() {
    if (
      this.viewportService.screenSize === 'xs' ||
      this.viewportService.screenSize === 'sm' ||
      this.viewportService.screenSize === 'md'
    ) {
      return 120;
    }
    return 180;
  }

  get encodedReferralUrl(): string {
    return encodeURIComponent(this.referralUrl);
  }

  get encodedShareMessage(): string {
    return encodeURIComponent(
      `Join me in this amazing game! Use my referral code ${this.referralCode} and get 3x XP Boosts! 🎮✨\n\n${this.referralUrl}`
    );
  }
}
