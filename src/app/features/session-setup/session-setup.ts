import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ActiveSessionService } from '../../services/active-session';
import { WorkoutDataService } from '../../services/workout-data';
import { Template } from '../../models/template';

@Component({
  selector: 'app-session-setup',
  imports: [RouterLink],
  templateUrl: './session-setup.html',
  styleUrl: './session-setup.css'
})
export class SessionSetupComponent {
  private activeSession = inject(ActiveSessionService);
  workoutData = inject(WorkoutDataService);
  private router = inject(Router);

  startBlank() {
    const name = `Workout ${new Date().toLocaleDateString()}`;
    this.activeSession.startBlankSession(name);
    this.router.navigate(['/session/active']);
  }

  startFromTemplate(template: Template) {
    this.activeSession.startFromTemplate(template.name, template);
    this.router.navigate(['/session/active']);
  }

  removeTemplate(templateId: string, event: Event) {
    event.stopPropagation();
    this.workoutData.removeTemplate(templateId);
  }

  exercisePreview(template: Template): string {
    return template.exercises
      .map(te => this.workoutData.getExerciseName(te.exerciseId))
      .join(', ');
  }

  relativeTime(iso: string | undefined): string {
    if (!iso) return '';
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  }
}