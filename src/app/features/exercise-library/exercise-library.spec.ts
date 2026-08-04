import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseLibraryComponent } from './exercise-library';

describe('ExerciseLibraryComponent', () => {
  let component: ExerciseLibraryComponent;
  let fixture: ComponentFixture<ExerciseLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseLibraryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExerciseLibraryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
