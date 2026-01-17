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
    DatePipe
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
    console.log('Dashboard init...');
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current user:', this.currentUser);
    const selectedFest = this.festivalSelectionService.getSelectedFestival();
    console.log('Selected festival from service:', selectedFest);
    this.selectedFestival.set(selectedFest);
    console.log('Selected festival signal set to:', this.selectedFestival());
  }
}