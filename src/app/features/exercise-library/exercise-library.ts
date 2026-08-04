import { Component } from '@angular/core';
import { Exercise } from '../../models/exercise';

@Component({
  selector: 'app-exercise-library',
  imports: [],
  templateUrl: './exercise-library.html',
  styleUrl: './exercise-library.css'
})
export class ExerciseLibraryComponent {
  exercises: Exercise[] = [
    {
      id: '1', name: 'Bench Press', muscleGroup: 'Chest', defaultUnit: 'kg',
      description: '',
      difficultyLevel: 'Beginner',
      equipmentUsed: []
    },
    {
      id: '2', name: 'Squat', muscleGroup: 'Legs', defaultUnit: 'kg',
      description: '',
      difficultyLevel: 'Beginner',
      equipmentUsed: []
    },
    {
      id: '3', name: 'Lat Pulldown', muscleGroup: 'Back', defaultUnit: 'kg',
      description: '',
      difficultyLevel: 'Beginner',
      equipmentUsed: []
    },
    {
      id: '4', name: 'Overhead Press', muscleGroup: 'Shoulders', defaultUnit: 'kg',
      description: '',
      difficultyLevel: 'Beginner',
      equipmentUsed: []
    },
  ];
}

