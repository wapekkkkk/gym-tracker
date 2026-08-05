import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutHistoryComponent } from './workout-history';

describe('WorkoutHistoryComponent', () => {
  let component: WorkoutHistoryComponent;
  let fixture: ComponentFixture<WorkoutHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutHistoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});