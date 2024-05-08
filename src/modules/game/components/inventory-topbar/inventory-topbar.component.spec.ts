import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryTopbarComponent } from './inventory-topbar.component';

describe('InventoryTopbarComponent', () => {
  let component: InventoryTopbarComponent;
  let fixture: ComponentFixture<InventoryTopbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InventoryTopbarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InventoryTopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
