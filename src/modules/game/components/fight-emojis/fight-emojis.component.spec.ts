import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FightEmojisComponent } from './fight-emojis.component';

describe('FightEmojisComponent', () => {
  let component: FightEmojisComponent;
  let fixture: ComponentFixture<FightEmojisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FightEmojisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FightEmojisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
