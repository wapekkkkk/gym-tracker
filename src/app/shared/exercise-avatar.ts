import { Exercise } from '../models/exercise';

const PALETTE = ['#3b9eff', '#22d47b', '#ff9f43', '#ff5e7e', '#a684ff', '#4fd1c5'];

export function avatarColor(exercise: Exercise): string {
  let hash = 0;
  for (const char of exercise.muscleGroup) hash = (hash * 31 + char.charCodeAt(0)) % PALETTE.length;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}