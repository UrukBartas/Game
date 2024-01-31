import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';

@Injectable({
  providedIn: 'root',
})
export class ExportImportService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/import-export';
  }
  public whiteListItem(itemId: string, address: string) {
    return this.post('/whitelist-export/' + address + '/' + itemId, {});
  }

  public uploadJsonMetadataNFT(item: any) {
    return this.post('/upload-metadata', item);
  }
}
