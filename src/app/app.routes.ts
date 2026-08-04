import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard';
import { ExerciseLibraryComponent } from './features/exercise-library/exercise-library';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'exercises', component: ExerciseLibraryComponent },
];