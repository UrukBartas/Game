import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiBaseService } from 'src/modules/core/services/api-base.service';
import { ItemTypeSC } from 'src/modules/game/activities/export-import-nft/enums/ItemTypesSC';

@Injectable({
  providedIn: 'root',
})
export class ExportImportService extends ApiBaseService {
  constructor(private http: HttpClient) {
    super(http);
    this.controllerPrefix = '/import-export';
  }
  public whiteListItems(
    itemId: number[],
    itemTypes: ItemTypeSC[],
    quantities: number[]
  ) {
    return this.post('/whitelist-export', {
      itemIds: itemId,
      itemTypes,
      itemQuantities: quantities,
    });
  }

  public whiteListItemERC20(amount: number) {
    return this.post('/whitelist-export-erc20/' + amount.toString(), {});
  }

  public uploadJsonMetadataNFT(item: { id: number; type: ItemTypeSC }) {
    return this.post('/upload-metadata', item);
  }
}
