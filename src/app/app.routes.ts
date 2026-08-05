import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard';
import { ExerciseLibraryComponent } from './features/exercise-library/exercise-library';
import { SessionSetupComponent } from './features/session-setup/session-setup';
import { ActiveSessionComponent } from './features/active-session/active-session';
import { TemplateLibraryComponent } from './features/template-library/template-library';
import { WorkoutHistoryComponent } from './features/workout-history/workout-history';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'exercises', component: ExerciseLibraryComponent },
  { path: 'templates', component: TemplateLibraryComponent },
  { path: 'session/start', component: SessionSetupComponent },
  { path: 'session/active', component: ActiveSessionComponent },
  {path: 'history', component: WorkoutHistoryComponent}
];