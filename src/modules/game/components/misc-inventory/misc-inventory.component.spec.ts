import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscInventoryComponent } from './misc-inventory.component';

describe('MiscInventoryComponent', () => {
  let component: MiscInventoryComponent;
  let fixture: ComponentFixture<MiscInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MiscInventoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MiscInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
