import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportImportNftComponent } from './export-import-nft.component';

describe('ExportImportNftComponent', () => {
  let component: ExportImportNftComponent;
  let fixture: ComponentFixture<ExportImportNftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportImportNftComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExportImportNftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
