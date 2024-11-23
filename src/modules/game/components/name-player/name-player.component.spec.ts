import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NamePlayerComponent } from './name-player.component';

describe('NamePlayerComponent', () => {
  let component: NamePlayerComponent;
  let fixture: ComponentFixture<NamePlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NamePlayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NamePlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
