import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankBadgeComponent } from './rank-badge.component';

describe('RankBadgeComponent', () => {
  let component: RankBadgeComponent;
  let fixture: ComponentFixture<RankBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankBadgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RankBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
