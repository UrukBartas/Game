import { QuestStatusEnum } from '../enums/quest-status.enum';

export interface QuestRouterModel {
  status: QuestStatusEnum;
  data?: any;
}
