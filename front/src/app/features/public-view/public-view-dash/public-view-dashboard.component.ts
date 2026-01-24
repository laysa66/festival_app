import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { FestivalService } from '../../../core/services/festival.service';
import { FestivalSelectionService } from '../../../core/services/festival-selection.service';
import { Festival } from '../../../core/models/festival';
import { PublicNavbarComponent } from '../../../shared/public-navbar/public-navbar.component';

@Component({
  selector: 'app-public-view-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    DatePipe,
    RouterModule,
    PublicNavbarComponent
  ],
  templateUrl: './public-view-dashboard.component.html',
  styleUrls: ['../public-view.component.css']
})
export class PublicViewDashboardComponent implements OnInit {
  private festivalService = inject(FestivalService);
  private festivalSelectionService = inject(FestivalSelectionService);

  festivals = signal<Festival[]>([]);
  lastFestival = signal<Festival | null>(null);
  selectedFestival = signal<Festival | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPublicData();
  }

  loadPublicData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.festivalService.getAllFestivals().subscribe({
      next: (data) => {
        if (data.length > 0) {
          // Sort by end date descending to get the most recent
          const sorted = [...data].sort((a, b) => {
            const dateA = new Date(a.dateFin).getTime();
            const dateB = new Date(b.dateFin).getTime();
            return dateB - dateA;
          });
          
          this.festivals.set(sorted);
          const lastFest = sorted[0];
          this.lastFestival.set(lastFest);
          this.selectFestival(lastFest);
        } else {
          this.festivals.set(data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading festivals:', err);
        this.error.set('Failed to load festivals. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  selectFestival(festival: Festival): void {
    // Only allow selection of the last (most recent) festival
    if (festival.id !== this.lastFestival()?.id) {
      return;
    }
    
    this.selectedFestival.set(festival);
    this.festivalSelectionService.setSelectedFestival(festival);
  }

  isFestivalSelected(festival: Festival): boolean {
    return this.selectedFestival()?.id === festival.id;
  }

  isLatestFestival(festival: Festival): boolean {
    return this.lastFestival()?.id === festival.id;
  }
}
