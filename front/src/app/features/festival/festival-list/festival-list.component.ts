import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FestivalService } from '../../../core/services/festival.service';
import { FestivalSelectionService } from '../../../core/services/festival-selection.service';
import { AuthService } from '../../../core/services/auth.service';
import { Festival } from '../../../core/models/festival';
import { UserRole } from '../../../core/models/user.interface';
import { FestivalCardComponent } from '../festival-card/festival-card.component';
import { FestivalFormComponent } from '../festival-form/festival-form.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-festival-list',
  imports: [
    CommonModule,
    FestivalCardComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './festival-list.component.html',
  styleUrl: './festival-list.component.css',
})
export class FestivalListComponent {
  festivals = signal<Festival[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  private authService = inject(AuthService);

  constructor(
    private festivalService: FestivalService,
    private festivalSelectionService: FestivalSelectionService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.loadFestivals();
  }

  canSelectFestival(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    
    return [
      UserRole.SUPER_ORGANISATEUR,
      UserRole.ADMIN,
      UserRole.ORGANISATEUR
    ].includes(user.role);
  }

  loadFestivals(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.festivalService.getAllFestivals().subscribe({
      next: (data) => {
        // Sort by end date descending to get the most recent first
        const sorted = [...data].sort((a, b) => {
          const dateA = new Date(a.dateFin).getTime();
          const dateB = new Date(b.dateFin).getTime();
          return dateB - dateA;
        });
        this.festivals.set(sorted);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading festivals:', err);
        this.error.set('Failed to load festivals');
        this.isLoading.set(false);
      },
    });
  }

  onFestivalDelete(id: number): void {
    if (confirm('Are you sure you want to delete this festival?')) {
      this.festivalService.deleteFestival(id).subscribe({
        next: () => {
          this.festivals.set(this.festivals().filter((f) => f.id !== id));
        },
        error: (err) => {
          console.error('Error deleting festival:', err);
          this.error.set('Failed to delete festival');
        },
      });
    }
  }

  openCreateForm(): void {
    const dialogRef = this.dialog.open(FestivalFormComponent, {
      width: '500px',
      data: null,
      autoFocus: false,
      panelClass: 'festival-form-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updated = [...this.festivals(), result];
        // Sort to maintain order
        const sorted = updated.sort((a, b) => {
          const dateA = new Date(a.dateFin).getTime();
          const dateB = new Date(b.dateFin).getTime();
          return dateB - dateA;
        });
        this.festivals.set(sorted);
        this.error.set(null);
      }
    });
  }

  openEditForm(festival: Festival): void {
    const dialogRef = this.dialog.open(FestivalFormComponent, {
      width: '500px',
      data: festival,
      autoFocus: false,
      panelClass: 'festival-form-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedFestivals = this.festivals().map((f) =>
          f.id === result.id ? result : f
        );
        // Sort to maintain order
        const sorted = updatedFestivals.sort((a, b) => {
          const dateA = new Date(a.dateFin).getTime();
          const dateB = new Date(b.dateFin).getTime();
          return dateB - dateA;
        });
        this.festivals.set(sorted);
        this.error.set(null);
        this.selectFestival(result);
      }
    });
  }

  selectFestival(festival: Festival): void {
    if (!this.canSelectFestival()) {
      this.error.set('You do not have permission to select a festival');
      return;
    }
    this.festivalSelectionService.setSelectedFestival(festival);
    this.router.navigate(['/dashboard']);
  }
}
