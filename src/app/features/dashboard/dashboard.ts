import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { WorkoutDataService } from '../../services/workout-data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  workoutData = inject(WorkoutDataService);
}