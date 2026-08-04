export interface PersonalBest {
  exerciseId: string;
  weight: number;
  reps: number;
  unit: 'kg' | 'lbs';
  volume: number;
  achievedDate: string;
  sessionId: string;
}