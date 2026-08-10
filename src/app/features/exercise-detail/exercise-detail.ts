import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { WorkoutDataService } from '../../services/workout-data';
import { avatarColor } from '../../shared/exercise-avatar';

interface HistoryRow {
  sessionId: string;
  sessionName: string;
  date: string;
  sets: { weight: number; reps: number; unit: 'kg' | 'lbs' }[];
}

@Component({
  selector: 'app-exercise-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './exercise-detail.html',
  styleUrl: './exercise-detail.css'
})
export class ExerciseDetailComponent {
  private route = inject(ActivatedRoute);
  workoutData = inject(WorkoutDataService);

  avatarColor = avatarColor;

  // toSignal isn't needed here — route.snapshot is enough since this page
  // is always reached via a fresh navigation (list row -> detail), never
  // updated in place while already on the page.
  private exerciseId = this.route.snapshot.paramMap.get('id') ?? '';

  exercise = computed(() =>
    this.workoutData.exercises().find(e => e.id === this.exerciseId)
  );

  personalBest = computed(() =>
    this.workoutData.personalBests().find(pb => pb.exerciseId === this.exerciseId)
  );

  history = computed<HistoryRow[]>(() => {
    const sessions = [...this.workoutData.sessions()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const rows: HistoryRow[] = [];
    for (const session of sessions) {
      const entry = session.entries.find(e => e.exerciseId === this.exerciseId);
      if (!entry || entry.sets.length === 0) continue;

      rows.push({
        sessionId: session.id,
        sessionName: session.name,
        date: session.date,
        sets: entry.sets.map(s => ({ weight: s.weight, reps: s.reps, unit: s.unit }))
      });
    }
    return rows;
  });
}