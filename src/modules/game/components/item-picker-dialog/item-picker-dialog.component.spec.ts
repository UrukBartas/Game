import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemPickerDialogComponent } from './item-picker-dialog.component';

describe('ItemPickerDialogComponent', () => {
  let component: ItemPickerDialogComponent;
  let fixture: ComponentFixture<ItemPickerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemPickerDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ItemPickerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
