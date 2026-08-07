export interface SetEntry {
  reps: number;
  weight: number;
  unit: 'kg' | 'lbs';
  restSeconds?: number;
  completed: boolean;
}

export interface WorkoutEntry {
  id: string;
  exerciseId: string;
  restSeconds: number;
  targetSets?: number;
  targetReps?: number;
  sets: SetEntry[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;          // ISO string — see note below
  status: 'active' | 'completed';
  sourceTemplateId?: string;
  entries: WorkoutEntry[];
  durationSeconds?: number; // set on finish — absent on sessions finished before this field existed
  prCount?: number;         // number of sets that beat the prior PB, set in completeSession()
}