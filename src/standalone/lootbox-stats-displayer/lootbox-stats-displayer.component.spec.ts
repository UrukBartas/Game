import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LootboxStatsDisplayerComponent } from './lootbox-stats-displayer.component';

describe('LootboxStatsDisplayerComponent', () => {
  let component: LootboxStatsDisplayerComponent;
  let fixture: ComponentFixture<LootboxStatsDisplayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LootboxStatsDisplayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LootboxStatsDisplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
