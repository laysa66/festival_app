import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../core/services/auth.service';
import { FestivalSelectionService } from '../../core/services/festival-selection.service';
import { User } from '../../core/models/user.interface';
import { Festival } from '../../core/models/festival';
import { ZoneManagementComponent } from '../festival/zone-management/zone-management.component';
import { ZonePlanManagementComponent } from '../festival/zone-plan-management/zone-plan-management.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    DatePipe,
    ZoneManagementComponent,
    ZonePlanManagementComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private festivalSelectionService = inject(FestivalSelectionService);
  private router = inject(Router);

  currentUser: User | null = null;
  selectedFestival = signal<Festival | null>(null);

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.selectedFestival.set(this.festivalSelectionService.getSelectedFestival());
  }
}