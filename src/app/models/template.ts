export interface TemplateExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
}

export interface Template {
  id: string;
  name: string;
  exercises: TemplateExercise[];
  createdAt: string; // ISO string — drives "X days ago" on Start Workout
}