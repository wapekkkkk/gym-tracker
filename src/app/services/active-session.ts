import { Injectable, signal, effect, inject } from '@angular/core';
import { WorkoutSession, WorkoutEntry, SetEntry} from '../models/session';
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

  const completed: WorkoutSession = { ...current, status: 'completed' };
  this.sessionData.set(null); // clears the active session
  return completed;
}
}