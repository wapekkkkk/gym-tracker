import { Component, inject, signal, computed, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkoutDataService } from '../../services/workout-data';
import { Exercise } from '../../models/exercise';

@Component({
  selector: 'app-exercise-picker',
  imports: [FormsModule],
  templateUrl: './exercise-picker.html',
  styleUrl: './exercise-picker.css'
})
export class ExercisePickerComponent {
  workoutData = inject(WorkoutDataService);

  // `output()` is the signal-based replacement for the old `@Output() x = new EventEmitter()`.
  // Functionally the same — the parent listens with `(closed)="..."` / `(exercisesSelected)="..."`
  // exactly like before — just a plain function call (`this.closed.emit()`) instead of
  // constructing an EventEmitter instance yourself.
  closed = output<void>();
  exercisesSelected = output<string[]>();

  searchTerm = signal('');
  bodyPartFilter = signal('');
  selectedIds = signal<Set<string>>(new Set());

  bodyParts = computed(() =>
    [...new Set(this.workoutData.exercises().map(e => e.muscleGroup))].sort()
  );

  filteredExercises = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const bodyPart = this.bodyPartFilter();

    return this.workoutData.exercises()
      .filter(e => (!term || e.name.toLowerCase().includes(term)) && (!bodyPart || e.muscleGroup === bodyPart))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  groupedExercises = computed(() => {
    const groups = new Map<string, Exercise[]>();
    for (const exercise of this.filteredExercises()) {
      const letter = exercise.name.charAt(0).toUpperCase();
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter)!.push(exercise);
    }
    return [...groups.entries()].map(([letter, exercises]) => ({ letter, exercises }));
  });

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggle(id: string) {
    const current = new Set(this.selectedIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedIds.set(current);
  }

  avatarColor(exercise: Exercise): string {
    const palette = ['#3b9eff', '#22d47b', '#ff9f43', '#ff5e7e', '#a684ff', '#4fd1c5'];
    let hash = 0;
    for (const char of exercise.muscleGroup) hash = (hash * 31 + char.charCodeAt(0)) % palette.length;
    return palette[Math.abs(hash) % palette.length];
  }

  cancel() {
    this.closed.emit();
  }

  confirmAdd() {
    const ids = [...this.selectedIds()];
    if (ids.length === 0) return;
    this.exercisesSelected.emit(ids);
  }
}