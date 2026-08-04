export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroup: string;
  defaultUnit: 'kg' | 'lbs';
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  equipmentUsed: string[];
}

