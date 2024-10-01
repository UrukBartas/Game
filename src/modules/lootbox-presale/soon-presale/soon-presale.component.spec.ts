import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoonPresaleComponent } from './soon-presale.component';

describe('SoonPresaleComponent', () => {
  let component: SoonPresaleComponent;
  let fixture: ComponentFixture<SoonPresaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoonPresaleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SoonPresaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
