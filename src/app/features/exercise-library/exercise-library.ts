import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkoutDataService } from '../../services/workout-data';
import { Exercise } from '../../models/exercise';

interface RecentExercisePreview {
  exercise: Exercise;
  weight: number;
  reps: number;
  unit: 'kg' | 'lbs';
}

@Component({
  selector: 'app-exercise-library',
  imports: [FormsModule],
  templateUrl: './exercise-library.html',
  styleUrl: './exercise-library.css'
})
export class ExerciseLibraryComponent {
  workoutData = inject(WorkoutDataService);

  showNewForm = signal(false);
  searchTerm = signal('');
  bodyPartFilter = signal(''); // '' = Any Body Part
  categoryFilter = signal(''); // '' = Any Category
  sortDescending = signal(false);

  newExerciseName = '';
  newExerciseMuscleGroup = '';
  newExerciseUnit: 'kg' | 'lbs' = 'kg';

  bodyParts = computed(() =>
    [...new Set(this.workoutData.exercises().map(e => e.muscleGroup))].sort()
  );

  categories = computed(() =>
    [...new Set(this.workoutData.exercises().flatMap(e => e.equipmentUsed))].sort()
  );

  filteredExercises = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const bodyPart = this.bodyPartFilter();
    const category = this.categoryFilter();

    const filtered = this.workoutData.exercises().filter(e => {
      if (term && !e.name.toLowerCase().includes(term)) return false;
      if (bodyPart && e.muscleGroup !== bodyPart) return false;
      if (category && !e.equipmentUsed.includes(category)) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (this.sortDescending()) sorted.reverse();
    return sorted;
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

  availableLetters = computed(() => this.groupedExercises().map(g => g.letter));

  // Derived live from session history — most recent set logged for the
  // most recently touched exercise. No new persisted field needed.
  recentExercise = computed<RecentExercisePreview | null>(() => {
    const sessions = [...this.workoutData.sessions()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastSession = sessions[0];
    if (!lastSession) return null;

    for (let i = lastSession.entries.length - 1; i >= 0; i--) {
      const entry = lastSession.entries[i];
      const lastSet = entry.sets[entry.sets.length - 1];
      if (!lastSet) continue;

      const exercise = this.workoutData.exercises().find(e => e.id === entry.exerciseId);
      if (!exercise) continue;

      return { exercise, weight: lastSet.weight, reps: lastSet.reps, unit: lastSet.unit };
    }
    return null;
  });

  toggleSort() {
    this.sortDescending.update(v => !v);
  }

  scrollToLetter(letter: string) {
    document.getElementById('letter-' + letter)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  avatarColor(exercise: Exercise): string {
    const palette = ['#3b9eff', '#22d47b', '#ff9f43', '#ff5e7e', '#a684ff', '#4fd1c5'];
    let hash = 0;
    for (const char of exercise.muscleGroup) hash = (hash * 31 + char.charCodeAt(0)) % palette.length;
    return palette[Math.abs(hash) % palette.length];
  }

  toggleNewForm() {
    this.showNewForm.update(v => !v);
  }

  addExercise() {
    if (!this.newExerciseName.trim() || !this.newExerciseMuscleGroup) {
      return;
    }

    this.workoutData.addExercise(
      this.newExerciseName,
      this.newExerciseMuscleGroup,
      this.newExerciseUnit
    );

    this.newExerciseName = '';
    this.newExerciseMuscleGroup = '';
    this.newExerciseUnit = 'kg';
    this.showNewForm.set(false);
  }
}