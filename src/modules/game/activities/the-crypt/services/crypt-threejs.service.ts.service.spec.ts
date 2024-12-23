import { TestBed } from '@angular/core/testing';

import { CryptThreejsServiceTsService } from './crypt-threejs.service.ts.service';

describe('CryptThreejsServiceTsService', () => {
  let service: CryptThreejsServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptThreejsServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
