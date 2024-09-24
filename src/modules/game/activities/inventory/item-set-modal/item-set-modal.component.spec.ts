import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemSetModalComponent } from './item-set-modal.component';

describe('ItemSetModalComponent', () => {
  let component: ItemSetModalComponent;
  let fixture: ComponentFixture<ItemSetModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemSetModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ItemSetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
