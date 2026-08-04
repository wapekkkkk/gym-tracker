import { Injectable, signal } from '@angular/core';
import { Exercise } from '../models/exercise';

@Injectable({
  providedIn: 'root'
})
export class WorkoutDataService {
  muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full body', 'Cardio'];

  // The array is private — components can't reach in and mutate it directly.
  // They only ever get the read-only signal below.
  private exercisesData = signal<Exercise[]>([
    { id: '1', name: 'Bench Press', muscleGroup: 'Chest', defaultUnit: 'kg', description: '', difficultyLevel: 'Beginner', equipmentUsed: [] },
    { id: '2', name: 'Squat', muscleGroup: 'Legs', defaultUnit: 'kg', description: '', difficultyLevel: 'Beginner', equipmentUsed: [] },
    { id: '3', name: 'Lat Pulldown', muscleGroup: 'Back', defaultUnit: 'kg', description: '', difficultyLevel: 'Beginner', equipmentUsed: [] },
    { id: '4', name: 'Overhead Press', muscleGroup: 'Shoulders', defaultUnit: 'kg', description: '', difficultyLevel: 'Beginner', equipmentUsed: [] },
  ]);

  // Public, read-only view of the signal — components can read it but not replace it.
  exercises = this.exercisesData.asReadonly();

  addExercise(name: string, muscleGroup: string, unit: 'kg' | 'lbs') {
    const exercise: Exercise = {
      id: crypto.randomUUID(),
      name,
      muscleGroup,
      defaultUnit: unit,
      description: '',
      difficultyLevel: 'Beginner',
      equipmentUsed: []
    };

    this.exercisesData.update(current => [...current, exercise]);
  }
}