import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

export enum AnnouncementType {
  SYSTEM_RATES = 'SYSTEM_RATES',
  EVENT = 'EVENT',
  UPDATE = 'UPDATE',
  MAINTENANCE = 'MAINTENANCE',
  PROMOTION = 'PROMOTION',
  CUSTOM = 'CUSTOM'
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  imageUrl: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AnnouncementsService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/announcements';
  }

  /**
   * Get all active announcements
   */
  getAllAnnouncements(): Observable<Announcement[]> {
    return this.get('');
  }

  /**
   * Get announcements by type
   */
  getAnnouncementsByType(type: AnnouncementType): Observable<Announcement[]> {
    return this.get(`/type/${type}`);
  }

  /**
   * Get system rates announcement
   */
  getSystemRates(): Observable<Announcement> {
    return this.get('/system-rates');
  }
}