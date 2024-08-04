export interface NotificationModel {
  id: number;
  playerId: string;
  global: boolean;
  title: string;
  titleImage?: string;
  description: string;
  content: string;
  attachments: any;
  createdAt: Date;
  updatedAt: Date;
  opened: string[];
  claimed: string[];
}
