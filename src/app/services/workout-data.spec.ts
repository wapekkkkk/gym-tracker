import { TestBed } from '@angular/core/testing';

import { WorkoutData } from './workout-data';

describe('WorkoutData', () => {
  let service: WorkoutData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkoutData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
