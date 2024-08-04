import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationModel } from 'src/modules/core/models/notifications.model';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/notifications';
  }

  create(
    playerId: string,
    global: boolean,
    content: string,
    attachments: string
  ): Observable<any[]> {
    return this.post('/create', {
      playerId,
      global,
      content,
      attachments,
    });
  }

  getNotifications(): Observable<NotificationModel[]> {
    return this.get('/');
  }

  openNotification(notificationId: number): Observable<void> {
    return this.get(`/${notificationId}/open`);
  }

  getAttachments(notificationId: number) {
    return this.get(`/${notificationId}/attachments`);
  }

  claimAttachments(notificationId: number) {
    return this.get(`/${notificationId}/claim`);
  }
}
