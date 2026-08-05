import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutDataService } from '../../services/workout-data';
import { ActiveSessionService } from '../../services/active-session';
import { Template, TemplateExercise } from '../../models/template';

@Component({
  selector: 'app-template-library',
  imports: [FormsModule],
  templateUrl: './template-library.html',
  styleUrl: './template-library.css'
})
export class TemplateLibraryComponent {
  workoutData = inject(WorkoutDataService);
  private activeSession = inject(ActiveSessionService);
  private router = inject(Router);

  templateName = '';
  draftExercises: TemplateExercise[] = [];

  selectedExerciseId = '';
  targetSets = 3;
  targetReps = 20;
  restSeconds = 90;

  addExerciseToDraft() {
    if (!this.selectedExerciseId) return;

    this.draftExercises.push({
      exerciseId: this.selectedExerciseId,
      targetSets: this.targetSets,
      targetReps: this.targetReps,
      restSeconds: this.restSeconds
    });

    this.selectedExerciseId = '';
    this.targetSets = 3;
    this.targetReps = 10;
    this.restSeconds = 90;
  }

  removeDraftExercise(index: number) {
    this.draftExercises.splice(index, 1);
  }

  saveTemplate() {
    if (!this.templateName.trim() || this.draftExercises.length === 0) return;

    this.workoutData.addTemplate(this.templateName.trim(), this.draftExercises);
    this.templateName = '';
    this.draftExercises = [];
  }

  startFromTemplate(template: Template) {
    this.activeSession.startFromTemplate(template.name, template);
    this.router.navigate(['/session/active']);
  }
}