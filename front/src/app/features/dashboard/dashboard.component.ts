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
import { Festival, ZoneTarifaire } from '../../core/models/festival';
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

  onZonesChanged(zones: ZoneTarifaire[]): void {
    const currentFestival = this.selectedFestival();
    if (currentFestival) {
      // Update the festival with the new zones
      const updatedFestival = { ...currentFestival, zoneTarifaires: zones };
      this.selectedFestival.set(updatedFestival);
      // Also update in the selection service for persistence
      this.festivalSelectionService.setSelectedFestival(updatedFestival);
    }
  }
}