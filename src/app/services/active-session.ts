import { Injectable, signal, effect, inject } from '@angular/core';
import { WorkoutSession, WorkoutEntry, SetEntry} from '../models/session';
import { Template } from '../models/template';
import { LocalStorageService } from './local-storage';

const STORAGE_KEY = 'gym-tracker:active-session';

@Injectable({
  providedIn: 'root'
})
export class ActiveSessionService {
  private storage = inject(LocalStorageService);

  private sessionData = signal<WorkoutSession | null>(
    this.storage.load<WorkoutSession | null>(STORAGE_KEY, null)
  );

  session = this.sessionData.asReadonly();

  constructor() {
    effect(() => {
      this.storage.save(STORAGE_KEY, this.sessionData());
    });
  }

  startBlankSession(name: string) {
    const newSession: WorkoutSession = {
      id: crypto.randomUUID(),
      name,
      date: new Date().toISOString(),
      status: 'active',
      entries: []
    };
    this.sessionData.set(newSession);
  }

  startFromTemplate(name: string, template: Template) {
  const entries: WorkoutEntry[] = template.exercises.map(te => ({
    id: crypto.randomUUID(),
    exerciseId: te.exerciseId,
    restSeconds: te.restSeconds,
    targetSets: te.targetSets,
    targetReps: te.targetReps,
    sets: []
  }));

  const newSession: WorkoutSession = {
    id: crypto.randomUUID(),
    name,
    date: new Date().toISOString(),
    status: 'active',
    sourceTemplateId: template.id,
    entries
  };
  this.sessionData.set(newSession);
}

  addExercise(exerciseId: string, restSeconds = 90) {
    const current = this.sessionData();
    if (!current) return;

    const entry: WorkoutEntry = {
      id: crypto.randomUUID(),
      exerciseId,
      restSeconds,
      sets: []
    };

    this.sessionData.set({ ...current, entries: [...current.entries, entry] });
  }

  removeExercise(entryId: string) {
    const current = this.sessionData();
    if (!current) return;

    this.sessionData.set({
      ...current,
      entries: current.entries.filter(e => e.id !== entryId)
    });
  }

  logCompletedSet(entryId: string, reps: number, weight: number, unit: 'kg' | 'lbs') {
    const current = this.sessionData();
    if (!current) return;

    const newSet: SetEntry = { reps, weight, unit, completed: true };

    const updatedEntries = current.entries.map(entry =>
      entry.id === entryId
        ? { ...entry, sets: [...entry.sets, newSet] }
        : entry
    );

    this.sessionData.set({ ...current, entries: updatedEntries });
  }

  finishSession(): WorkoutSession | null {
  const current = this.sessionData();
  if (!current) return null;

  const durationSeconds = Math.round((Date.now() - new Date(current.date).getTime()) / 1000);
  const completed: WorkoutSession = { ...current, status: 'completed', durationSeconds };
  this.sessionData.set(null);
  return completed;
}
discardSession() {
  this.sessionData.set(null);
}
}