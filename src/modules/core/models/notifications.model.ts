import { PlayerModel } from "./player.model";

export interface NotificationModel {
  id: number;
  playerId: string;
  senderId?: string;
  sender?: PlayerModel;
  global: boolean;
  title: string;
  titleImage?: string;
  description: string;
  content: string;
  attachments: any;
  opened: string[];
  claimed: string[];
  createdAt: Date;
  updatedAt: Date;
  isMessage?: boolean;
}

export interface NotificationResponseModel {
  notifications: NotificationModel[];
  newNotificationsCount: number;
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
}

// Nuevo modelo para mensajes
export interface MessageModel {
  id: number;
  playerId: string;
  senderId: string;
  sender?: {
    id: string;
    name: string;
    image: string;
  };
  player?: {
    id: string;
    name: string;
    image: string;
  };
  title: string;
  description: string;
  content: string;
  opened: string[];
  createdAt: Date;
  updatedAt: Date;
  isMessage: boolean;
}

export interface MessageResponseModel {
  messages: MessageModel[];
  unreadCount?: number;
  currentPage: number;
  totalPages: number;
  totalMessages: number;
}
