import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChanceDisplayerComponent } from './chance-displayer.component';

describe('ChanceDisplayerComponent', () => {
  let component: ChanceDisplayerComponent;
  let fixture: ComponentFixture<ChanceDisplayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChanceDisplayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChanceDisplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
