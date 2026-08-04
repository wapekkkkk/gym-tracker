import { Injectable, signal, effect, inject } from '@angular/core';
import { Exercise } from '../models/exercise';
import { WorkoutSession } from '../models/session';
import { PersonalBest } from '../models/personal-best';
import { LocalStorageService } from './local-storage';

const STORAGE_KEY = 'gym-tracker:workout-data';

interface WorkoutData {
  exercises: Exercise[];
  sessions: WorkoutSession[];
  personalBests: PersonalBest[];
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

  // Load everything once at startup — one read instead of three.
  private loaded = this.storage.load<WorkoutData>(STORAGE_KEY, {
    exercises: DEFAULT_EXERCISES,
    sessions: [],
    personalBests: []
  });

  private exercisesData = signal<Exercise[]>(this.loaded.exercises);
  private sessionsData = signal<WorkoutSession[]>(this.loaded.sessions);
  private personalBestsData = signal<PersonalBest[]>(this.loaded.personalBests);

  exercises = this.exercisesData.asReadonly();
  sessions = this.sessionsData.asReadonly();
  personalBests = this.personalBestsData.asReadonly();

  constructor() {
    effect(() => {
      this.storage.save<WorkoutData>(STORAGE_KEY, {
        exercises: this.exercisesData(),
        sessions: this.sessionsData(),
        personalBests: this.personalBestsData()
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

  getExerciseName(exerciseId: string): string {
    return this.exercisesData().find(e => e.id === exerciseId)?.name ?? 'Unknown exercise';
  }

  completeSession(session: WorkoutSession) {
    this.sessionsData.update(current => [...current, session]);

    for (const entry of session.entries) {
      for (const set of entry.sets) {
        const volume = set.weight * set.reps;
        const existing = this.personalBestsData().find(pb => pb.exerciseId === entry.exerciseId);

        if (!existing || volume > existing.volume) {
          const newPb: PersonalBest = {
            exerciseId: entry.exerciseId,
            weight: set.weight,
            reps: set.reps,
            unit: set.unit,
            volume,
            achievedDate: session.date,
            sessionId: session.id
          };

          this.personalBestsData.update(current => [
            ...current.filter(pb => pb.exerciseId !== entry.exerciseId),
            newPb
          ]);
        }
      }
    }
  }
}