import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Exercise } from '../../models/exercise';

@Component({
  selector: 'app-exercise-library',
  imports: [FormsModule],
  templateUrl: './exercise-library.html',
  styleUrl: './exercise-library.css'
})
export class ExerciseLibraryComponent {
  muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full body', 'Cardio'];

  exercises: Exercise[] = [
    { id: '1', name: 'Bench Press', muscleGroup: 'Chest', defaultUnit: 'kg', description: '', difficultyLevel: 'Beginner', equipmentUsed: [] },
    { id: '2', name: 'Squat', muscleGroup: 'Legs', defaultUnit: 'kg', description: '', difficultyLevel: 'Beginner', equipmentUsed: [] },
    { id: '3', name: 'Lat Pulldown', muscleGroup: 'Back', defaultUnit: 'kg', description: '', difficultyLevel: 'Beginner', equipmentUsed: [] },
    { id: '4', name: 'Overhead Press', muscleGroup: 'Shoulders', defaultUnit: 'kg', description: '', difficultyLevel: 'Beginner', equipmentUsed: [] },
  ];

  newExerciseName = '';
  newExerciseMuscleGroup = '';
  newExerciseUnit: 'kg' | 'lbs' = 'kg';

  addExercise() {
    if (!this.newExerciseName.trim() || !this.newExerciseMuscleGroup) {
      return;
    }

    const exercise: Exercise = {
      id: crypto.randomUUID(),
      name: this.newExerciseName,
      muscleGroup: this.newExerciseMuscleGroup,
      defaultUnit: this.newExerciseUnit,
      description: '',
      difficultyLevel: 'Beginner',
      equipmentUsed: []
    };

    this.exercises.push(exercise);

    this.newExerciseName = '';
    this.newExerciseMuscleGroup = '';
    this.newExerciseUnit = 'kg';
  }
}