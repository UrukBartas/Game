import { QuestModel } from './quest.model';
import {
  HelmetModel,
  GlovesModel,
  TrousersModel,
  BootsModel,
  WeaponModel,
  ShieldModel,
  RingModel,
  TotemModel,
  ChestModel,
} from './items.model';
import { SessionModel } from './session.model';

export interface PlayerModel {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  image: string;
  level: number;
  experience: number;
  health: number;
  energy: number;
  attack: number;
  defense: number;
  helmet?: HelmetModel | null;
  chest?: ChestModel | null;
  gloves?: GlovesModel | null;
  trousers?: TrousersModel | null;
  boots?: BootsModel | null;
  weapon?: WeaponModel | null;
  shield?: ShieldModel | null;
  ring?: RingModel | null;
  totem?: TotemModel | null;
  sessions: SessionModel[];
  activeQuests: QuestModel[];
}
