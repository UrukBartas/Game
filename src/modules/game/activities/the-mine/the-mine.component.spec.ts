import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheMineComponent } from './the-mine.component';

describe('TheMineComponent', () => {
  let component: TheMineComponent;
  let fixture: ComponentFixture<TheMineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TheMineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TheMineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
