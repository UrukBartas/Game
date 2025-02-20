import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryTutorialComponent } from './inventory-tutorial.component';

describe('InventoryTutorialComponent', () => {
  let component: InventoryTutorialComponent;
  let fixture: ComponentFixture<InventoryTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InventoryTutorialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InventoryTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
