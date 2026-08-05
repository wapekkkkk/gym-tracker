import { Injectable, signal, effect, inject } from '@angular/core';
import { Exercise } from '../models/exercise';
import { WorkoutSession } from '../models/session';
import { PersonalBest } from '../models/personal-best';
import { Template, TemplateExercise } from '../models/template';
import { LocalStorageService } from './local-storage';

const STORAGE_KEY = 'gym-tracker:workout-data';

interface WorkoutData {
  exercises: Exercise[];
  sessions: WorkoutSession[];
  personalBests: PersonalBest[];
  templates: Template[];
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

  private loaded = this.storage.load<WorkoutData>(STORAGE_KEY, {
    exercises: DEFAULT_EXERCISES,
    sessions: [],
    personalBests: [],
    templates: []
  });

  
private exercisesData = signal<Exercise[]>(this.loaded.exercises ?? DEFAULT_EXERCISES);
private sessionsData = signal<WorkoutSession[]>(this.loaded.sessions ?? []);
private personalBestsData = signal<PersonalBest[]>(this.loaded.personalBests ?? []);
private templatesData = signal<Template[]>(this.loaded.templates ?? []);

  exercises = this.exercisesData.asReadonly();
  sessions = this.sessionsData.asReadonly();
  personalBests = this.personalBestsData.asReadonly();
  templates = this.templatesData.asReadonly();

  constructor() {
    effect(() => {
      this.storage.save<WorkoutData>(STORAGE_KEY, {
        exercises: this.exercisesData(),
        sessions: this.sessionsData(),
        personalBests: this.personalBestsData(),
        templates: this.templatesData()
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

  addTemplate(name: string, exercises: TemplateExercise[]) {
    const template: Template = {
      id: crypto.randomUUID(),
      name,
      exercises
    };
    this.templatesData.update(current => [...current, template]);
  }

  removeTemplate(templateId: string) {
    this.templatesData.update(current => current.filter(t => t.id !== templateId));
  }

  // One-way snapshot: never mutates the original template if the session was
  // started from one — this is an explicit new save, per the plan's
  // "decoupled after creation" decision.
  saveSessionAsTemplate(name: string, session: WorkoutSession) {
    const exercises: TemplateExercise[] = session.entries.map(entry => ({
      exerciseId: entry.exerciseId,
      targetSets: entry.sets.length || 3,
      targetReps: entry.sets[0]?.weight ?? 20,
      restSeconds: entry.restSeconds
    }));
    this.addTemplate(name, exercises);
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