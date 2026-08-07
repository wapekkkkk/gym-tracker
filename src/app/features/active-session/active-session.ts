import { Component, inject, signal, effect, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActiveSessionService } from '../../services/active-session';
import { WorkoutDataService } from '../../services/workout-data';
import { WorkoutEntry, SetEntry } from '../../models/session';
import { ExercisePickerComponent } from '../exercise-picker/exercise-picker';

interface PendingSet {
  reps: number;
  weight: number;
}

@Component({
  selector: 'app-active-session',
  imports: [RouterLink, FormsModule, DatePipe, ExercisePickerComponent],
  templateUrl: './active-session.html',
  styleUrl: './active-session.css'
})
export class ActiveSessionComponent implements OnDestroy {
  activeSession = inject(ActiveSessionService);
  workoutData = inject(WorkoutDataService);
  private router = inject(Router);

  showExercisePicker = signal(false);
pendingSets: Record<string, PendingSet[]> = {};

  openExercisePicker() {
    this.showExercisePicker.set(true);
  }

  onPickerClosed() {
    this.showExercisePicker.set(false);
  }

  onExercisesSelected(exerciseIds: string[]) {
    for (const id of exerciseIds) {
      this.activeSession.addExercise(id);
    }
    this.showExercisePicker.set(false);
  }

  restingEntryId = signal<string | null>(null);
  secondsRemaining = signal(0);
  private timerHandle: ReturnType<typeof setInterval> | null = null;

  elapsedSeconds = signal(0);
  private elapsedHandle: ReturnType<typeof setInterval> | null = null;

  showFinishPrompt = signal(false);
  saveAsTemplate = false;
  templateName = '';

  private prefilledEntryIds = new Set<string>();

  constructor() {
    effect(() => this.prefillFromTargets());

    // Ticks the "time since session started" display. Re-runs whenever
    // activeSession.session() changes identity (e.g. a fresh session begins),
    // clearing the old interval so we never end up with two tickers running.
    effect(() => {
      const session = this.activeSession.session();
      if (this.elapsedHandle) clearInterval(this.elapsedHandle);
      if (!session) return;

      const tick = () => {
        const startedMs = new Date(session.date).getTime();
        this.elapsedSeconds.set(Math.max(0, Math.round((Date.now() - startedMs) / 1000)));
      };
      tick();
      this.elapsedHandle = setInterval(tick, 1000);
    });
  }




  exerciseName(exerciseId: string): string {
    return this.workoutData.exercises().find(e => e.id === exerciseId)?.name ?? 'Unknown exercise';
  }

  exerciseUnit(exerciseId: string): 'kg' | 'lbs' {
    return this.workoutData.exercises().find(e => e.id === exerciseId)?.defaultUnit ?? 'kg';
  }

  getPendingRows(entryId: string): PendingSet[] {
    if (!this.pendingSets[entryId]) {
      this.pendingSets[entryId] = [];
    }
    return this.pendingSets[entryId];
  }

  addPendingRow(entryId: string) {
    this.getPendingRows(entryId).push({ reps: 0, weight: 0 });
  }

  confirmSet(entry: WorkoutEntry, rowIndex: number) {
    const rows = this.getPendingRows(entry.id);
    const input = rows[rowIndex];
    if (!input || input.reps <= 0 || input.weight <= 0) return;

    this.activeSession.logCompletedSet(entry.id, input.reps, input.weight, this.exerciseUnit(entry.exerciseId));
    rows.splice(rowIndex, 1);
    this.startRestTimer(entry.id, entry.restSeconds);
  }

  removePendingRow(entryId: string, rowIndex: number) {
    this.getPendingRows(entryId).splice(rowIndex, 1);
  }

  private startRestTimer(entryId: string, seconds: number) {
    if (this.timerHandle) clearInterval(this.timerHandle);
    this.restingEntryId.set(entryId);
    this.secondsRemaining.set(seconds);

    this.timerHandle = setInterval(() => {
      const remaining = this.secondsRemaining();
      if (remaining <= 1) {
        this.stopRestTimer();
      } else {
        this.secondsRemaining.set(remaining - 1);
      }
    }, 1000);
  }

  stopRestTimer() {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
    this.restingEntryId.set(null);
  }

  ngOnDestroy() {
    if (this.timerHandle) clearInterval(this.timerHandle);
    if (this.elapsedHandle) clearInterval(this.elapsedHandle);
  }

  private prefillFromTargets() {
    const session = this.activeSession.session();
    if (!session) return;

    for (const entry of session.entries) {
      if (this.prefilledEntryIds.has(entry.id)) continue;
      if (!entry.targetSets || !entry.targetReps) continue;
      if (entry.sets.length > 0 || this.getPendingRows(entry.id).length > 0) continue;

      for (let i = 0; i < entry.targetSets; i++) {
        this.getPendingRows(entry.id).push({ reps: entry.targetReps, weight: 0 });
      }
      this.prefilledEntryIds.add(entry.id);
    }
  }

  openFinishPrompt() {
    const session = this.activeSession.session();
    this.templateName = session ? `${session.name} template` : '';
    this.saveAsTemplate = false;
    this.showFinishPrompt.set(true);
  }

  cancelFinishPrompt() {
    this.showFinishPrompt.set(false);
  }

  confirmFinishSession() {
    const completed = this.activeSession.finishSession();
    if (!completed) return;

    this.workoutData.completeSession(completed);

    if (this.saveAsTemplate && this.templateName.trim()) {
      this.workoutData.saveSessionAsTemplate(this.templateName.trim(), completed);
    }

    this.showFinishPrompt.set(false);
    this.router.navigate(['/dashboard']);
  }

  discardSession() {
    if (!window.confirm('Discard this workout? This can\'t be undone.')) return;
    if (this.timerHandle) clearInterval(this.timerHandle);
    this.restingEntryId.set(null);
    this.activeSession.discardSession();
    this.router.navigate(['/session/start']);
  }

  // Most recent past session that logged this exercise — drives the
  // "Previous" column. Returns [] if it's never been done before.
  previousSetsFor(exerciseId: string): SetEntry[] {
    const sessions = [...this.workoutData.sessions()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    for (const session of sessions) {
      const entry = session.entries.find(e => e.exerciseId === exerciseId);
      if (entry && entry.sets.length > 0) return entry.sets;
    }
    return [];
  }

  formatPreviousSet(sets: SetEntry[], index: number): string | null {
    const s = sets[index];
    return s ? `${s.weight} ${s.unit} × ${s.reps}` : null;
  }

  isLiveRestBar(entry: WorkoutEntry): boolean {
    return this.restingEntryId() === entry.id;
  }

  restProgressPercent(entry: WorkoutEntry): number {
    if (entry.restSeconds <= 0) return 0;
    return Math.max(0, Math.min(100, (this.secondsRemaining() / entry.restSeconds) * 100));
  }

  formatElapsed(): string {
    return this.formatMMSS(this.elapsedSeconds());
  }

  formatRest(seconds: number): string {
    return this.formatMMSS(seconds);
  }

  private formatMMSS(totalSeconds: number): string {
    const s = Math.max(0, Math.round(totalSeconds));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }
}