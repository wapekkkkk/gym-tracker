import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActiveSessionService } from '../../services/active-session';
import { WorkoutDataService } from '../../services/workout-data';
import { Template } from '../../models/template';

@Component({
  selector: 'app-session-setup',
  imports: [FormsModule],
  templateUrl: './session-setup.html',
  styleUrl: './session-setup.css'
})
export class SessionSetupComponent {
  private activeSession = inject(ActiveSessionService);
  workoutData = inject(WorkoutDataService);
  private router = inject(Router);

  sessionName = '';

  startBlank() {
    const name = this.sessionName.trim() || `Workout ${new Date().toLocaleDateString()}`;
    this.activeSession.startBlankSession(name);
    this.router.navigate(['/session/active']);
  }

  startFromTemplate(template: Template) {
    const name = this.sessionName.trim() || template.name;
    this.activeSession.startFromTemplate(name, template);
    this.router.navigate(['/session/active']);
  }
}