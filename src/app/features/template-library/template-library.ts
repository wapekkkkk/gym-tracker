import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { WorkoutDataService } from '../../services/workout-data';
import { ActiveSessionService } from '../../services/active-session';
import { Template, TemplateExercise } from '../../models/template';
import { relativeTime } from '../../shared/relative-time';

@Component({
  selector: 'app-template-library',
  imports: [FormsModule, RouterLink],
  templateUrl: './template-library.html',
  styleUrl: './template-library.css'
})
export class TemplateLibraryComponent {
  workoutData = inject(WorkoutDataService);
  private activeSession = inject(ActiveSessionService);
  private router = inject(Router);

  relativeTime = relativeTime;

  templateName = '';
  draftExercises: TemplateExercise[] = [];

  selectedExerciseId = '';
  targetSets = 3;
  targetReps = 10;
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

  exerciseName(exerciseId: string): string {
    return this.workoutData.getExerciseName(exerciseId);
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

  removeTemplate(templateId: string, event: Event) {
    event.stopPropagation();
    this.workoutData.removeTemplate(templateId);
  }

  exercisePreview(template: Template): string {
    return template.exercises
      .map(te => this.workoutData.getExerciseName(te.exerciseId))
      .join(', ');
  }
}