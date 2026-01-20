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
import { FestivalService } from '../../core/services/festival.service';
import { User } from '../../core/models/user.interface';
import { Festival } from '../../core/models/festival';
import { ZoneTarifaireManagementComponent } from '../festival/zone-tarifaire-management/zone-tarifaire-management.component';
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
    ZoneTarifaireManagementComponent,
    ZonePlanManagementComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private festivalSelectionService = inject(FestivalSelectionService);
  private festivalService = inject(FestivalService);
  private router = inject(Router);

  currentUser: User | null = null;
  selectedFestival = signal<Festival | null>(null);

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const storedFestival = this.festivalSelectionService.getSelectedFestival();
    
    if (storedFestival) {
      this.selectedFestival.set(storedFestival);
    } else {
      // If no festival is selected, load the first one from database
      this.loadFirstFestival();
    }
  }

  loadFirstFestival(): void {
    this.festivalService.getAllFestivals().subscribe({
      next: (festivals) => {
        if (festivals.length > 0) {
          // Sort by end date descending to get the most recent
          const sorted = [...festivals].sort((a, b) => {
            const dateA = new Date(a.dateFin).getTime();
            const dateB = new Date(b.dateFin).getTime();
            return dateB - dateA;
          });
          
          const festival = sorted[0];
          this.selectedFestival.set(festival);
          this.festivalSelectionService.setSelectedFestival(festival);
        }
      },
      error: (err) => {
        console.error('Error loading festivals:', err);
      }
    });
  }
}