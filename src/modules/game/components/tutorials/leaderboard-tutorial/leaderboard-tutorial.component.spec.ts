import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardTutorialComponent } from './leaderboard-tutorial.component';

describe('LeaderboardTutorialComponent', () => {
  let component: LeaderboardTutorialComponent;
  let fixture: ComponentFixture<LeaderboardTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeaderboardTutorialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeaderboardTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
