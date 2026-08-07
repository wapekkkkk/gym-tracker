import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercisePickerComponent } from './exercise-picker';

describe('ExercisePicker', () => {
  let component: ExercisePickerComponent;
  let fixture: ComponentFixture<ExercisePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExercisePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExercisePickerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
