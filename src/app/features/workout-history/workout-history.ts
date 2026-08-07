import { Component, inject, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { WorkoutDataService } from '../../services/workout-data';
import { WorkoutSession, WorkoutEntry } from '../../models/session';

interface MonthGroup {
  label: string;
  sessions: WorkoutSession[];
}

@Component({
  selector: 'app-workout-history',
  imports: [DatePipe],
  templateUrl: './workout-history.html',
  styleUrl: './workout-history.css'
})
export class WorkoutHistoryComponent {
  workoutData = inject(WorkoutDataService);

  sortedSessions = computed<WorkoutSession[]>(() =>
    [...this.workoutData.sessions()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  );

  // Groups already-sorted sessions by "August 2026" style label,
  // preserving newest-first order since sortedSessions() is sorted first.
  monthGroups = computed<MonthGroup[]>(() => {
    const groups: MonthGroup[] = [];
    for (const session of this.sortedSessions()) {
      const label = new Date(session.date)
        .toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
        .toUpperCase();

      const lastGroup = groups[groups.length - 1];
      if (lastGroup?.label === label) {
        lastGroup.sessions.push(session);
      } else {
        groups.push({ label, sessions: [session] });
      }
    }
    return groups;
  });

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

  formatDuration(seconds: number | undefined): string | null {
    if (!seconds || seconds <= 0) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  }

  bestSet(entry: WorkoutEntry): string | null {
    if (entry.sets.length === 0) return null;
    const best = entry.sets.reduce((a, b) => (b.weight * b.reps > a.weight * a.reps ? b : a));
    return `${best.weight} ${best.unit} × ${best.reps}`;
  }
}