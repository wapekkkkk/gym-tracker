import { Injectable, signal, effect, inject } from '@angular/core';
import { Exercise } from '../models/exercise';
import { LocalStorageService } from './local-storage';

const STORAGE_KEY = 'gym-tracker:workout-data';

interface WorkoutData {
  exercises: Exercise[];
}

const DEFAULT_EXERCISES: Exercise[] = [
  { id: '1', name: 'Bench Press', muscleGroup: 'Chest', defaultUnit: 'kg', description: '', difficultyLevel: 'Beginner', equipmentUsed: [] },
  { id: '2', name: 'Squat', muscleGroup: 'Legs', defaultUnit: 'kg', description: '', difficultyLevel: 'Beginner', equipmentUsed: [] },
  { id: '3', name: 'Lat Pulldown', muscleGroup: 'Back', defaultUnit: 'kg', description: '', difficultyLevel: 'Beginner', equipmentUsed: [] },
  { id: '4', name: 'Overhead Press', muscleGroup: 'Shoulders', defaultUnit: 'kg', description: '', difficultyLevel: 'Beginner', equipmentUsed: [] },
];

@Injectable({
  providedIn: 'root'
})
export class WorkoutDataService {
  private storage = inject(LocalStorageService);

  muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full body', 'Cardio'];

  private exercisesData = signal<Exercise[]>(
    this.storage.load<WorkoutData>(STORAGE_KEY, { exercises: DEFAULT_EXERCISES }).exercises
  );

  exercises = this.exercisesData.asReadonly();

  constructor() {
    // Runs automatically every time exercisesData changes, and once immediately on startup.
    effect(() => {
      this.storage.save<WorkoutData>(STORAGE_KEY, {
        exercises: this.exercisesData()
      });
    });
  }

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