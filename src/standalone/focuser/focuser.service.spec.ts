import { TestBed } from '@angular/core/testing';

import { FocuserService } from './focuser.service';

describe('FocuserService', () => {
  let service: FocuserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FocuserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
