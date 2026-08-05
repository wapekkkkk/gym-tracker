import { Component, inject, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { WorkoutDataService } from '../../services/workout-data';
import { WorkoutSession } from '../../models/session';

@Component({
  selector: 'app-workout-history',
  imports: [DatePipe],
  templateUrl: './workout-history.html',
  styleUrl: './workout-history.css'
})
export class WorkoutHistoryComponent {
  workoutData = inject(WorkoutDataService);

  // Newest first — sessions() is append-only from completeSession(),
  // so a plain reverse-by-date derived signal is all this needs.
  sortedSessions = computed<WorkoutSession[]>(() =>
    [...this.workoutData.sessions()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  );

  private expandedIds = signal<Set<string>>(new Set());

  isExpanded(sessionId: string): boolean {
    return this.expandedIds().has(sessionId);
  }

  toggleExpanded(sessionId: string) {
    const current = new Set(this.expandedIds());
    if (current.has(sessionId)) {
      current.delete(sessionId);
    } else {
      current.add(sessionId);
    }
    this.expandedIds.set(current);
  }

  exerciseName(exerciseId: string): string {
    return this.workoutData.getExerciseName(exerciseId);
  }

  sessionVolume(session: WorkoutSession): number {
    return session.entries.reduce(
      (total, entry) =>
        total + entry.sets.reduce((setTotal, set) => setTotal + set.weight * set.reps, 0),
      0
    );
  }
}