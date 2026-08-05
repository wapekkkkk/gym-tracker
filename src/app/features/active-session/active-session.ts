import { Component, inject, signal, effect, OnDestroy } from '@angular/core';
//                                  ^^^^^^ add this — needed for the constructor below
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

  pendingSets: Record<string, PendingSet[]> = {};

  restingEntryId = signal<string | null>(null);
  secondsRemaining = signal(0);
  private timerHandle: ReturnType<typeof setInterval> | null = null;

  showFinishPrompt = signal(false);
  saveAsTemplate = false;
  templateName = '';

  // NEW — put these two members here, right after your other field declarations
  // and before any methods. Order among fields doesn't matter functionally,
  // but keeping it near the other signal/state fields keeps things scannable.
  private prefilledEntryIds = new Set<string>();

  // NEW — the constructor. This class doesn't have one yet (it only has
  // ngOnDestroy), so this is a new addition — goes right after the field
  // declarations, before ngOnDestroy or any other method.
  constructor() {
    effect(() => this.prefillFromTargets());
  }

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

  // NEW — private helper, place it anywhere among the other methods.
  // I'd put it right before openFinishPrompt(), since finish-flow and
  // this are both "session lifecycle" concerns, but placement here is
  // purely organizational — it doesn't affect behavior.
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
}