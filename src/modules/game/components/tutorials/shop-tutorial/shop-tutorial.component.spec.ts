import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopTutorialComponent } from './shop-tutorial.component';

describe('ShopTutorialComponent', () => {
  let component: ShopTutorialComponent;
  let fixture: ComponentFixture<ShopTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShopTutorialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShopTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
