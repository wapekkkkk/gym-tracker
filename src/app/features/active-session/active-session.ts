import { Component, inject, signal, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActiveSessionService } from '../../services/active-session';
import { WorkoutDataService } from '../../services/workout-data';
import { WorkoutEntry } from '../../models/session';
import { Router } from '@angular/router';

interface PendingSet {
  reps: number;
  weight: number;
}

@Component({
  selector: 'app-active-session',
  imports: [RouterLink, FormsModule],
  templateUrl: './active-session.html',
  styleUrl: './active-session.css'
})
export class ActiveSessionComponent implements OnDestroy {
  activeSession = inject(ActiveSessionService);
  workoutData = inject(WorkoutDataService);
  private router = inject(Router);
  selectedExerciseId = '';

  // Each entry can have MULTIPLE pending (not-yet-confirmed) set rows at once
  pendingSets: Record<string, PendingSet[]> = {};

  restingEntryId = signal<string | null>(null);
  secondsRemaining = signal(0);
  private timerHandle: ReturnType<typeof setInterval> | null = null;

  addExercise() {
    if (!this.selectedExerciseId) return;
    this.activeSession.addExercise(this.selectedExerciseId);
    this.selectedExerciseId = '';
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

    // Remove just this row, leave any other pending rows untouched
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
  }
 finishSession() {
    const completed = this.activeSession.finishSession();
    if (completed) {
      this.workoutData.completeSession(completed);
      this.router.navigate(['/dashboard']);
    }
  }
}