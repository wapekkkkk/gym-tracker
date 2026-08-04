import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkoutDataService } from '../../services/workout-data';

@Component({
  selector: 'app-exercise-library',
  imports: [FormsModule],
  templateUrl: './exercise-library.html',
  styleUrl: './exercise-library.css'
})
export class ExerciseLibraryComponent {
  workoutData = inject(WorkoutDataService);

  newExerciseName = '';
  newExerciseMuscleGroup = '';
  newExerciseUnit: 'kg' | 'lbs' = 'kg';

  addExercise() {
    if (!this.newExerciseName.trim() || !this.newExerciseMuscleGroup) {
      return;
    }

    this.workoutData.addExercise(
      this.newExerciseName,
      this.newExerciseMuscleGroup,
      this.newExerciseUnit
    );

    this.newExerciseName = '';
    this.newExerciseMuscleGroup = '';
    this.newExerciseUnit = 'kg';
  }
}