import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActiveSessionService } from '../../services/active-session';

@Component({
  selector: 'app-session-setup',
  imports: [FormsModule],
  templateUrl: './session-setup.html',
  styleUrl: './session-setup.css'
})
export class SessionSetupComponent {
  private activeSession = inject(ActiveSessionService);
  private router = inject(Router);

  sessionName = '';

  startBlank() {
    const name = this.sessionName.trim() || `Workout ${new Date().toLocaleDateString()}`;
    this.activeSession.startBlankSession(name);
    this.router.navigate(['/session/active']);
  }
}