import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { FestivalService } from '../../../core/services/festival.service';
import { FestivalSelectionService } from '../../../core/services/festival-selection.service';
import { PublicNavbarComponent } from '../../../shared/public-navbar/public-navbar.component';

interface GameDisplay {
  id?: number;
  libelle: string;
  auteur?: string;
  theme?: string;
  ageMin?: number;
  description?: string;
  image?: string;
  duree?: number;
  nbMinJoueur?: number;
  nbMaxJoueur?: number;
  typeJeu?: { id: number; libelle: string };
}

@Component({
  selector: 'app-public-view-games',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    DatePipe,
    RouterModule,
    PublicNavbarComponent
  ],
  templateUrl: './public-view-games.component.html',
  styleUrls: ['../public-view.component.css']
})
export class PublicViewGamesComponent implements OnInit {
  private festivalService = inject(FestivalService);
  private festivalSelectionService = inject(FestivalSelectionService);

  allGames = signal<GameDisplay[]>([]);
  filteredGames = signal<GameDisplay[]>([]);
  paginatedGames = signal<GameDisplay[]>([]);
  gameTypes = signal<any[]>([]);
  
  // Search and filter
  searchTerm = signal<string>('');
  selectedGameType = signal<number | null>(null);
  
  // Pagination
  pageSize = signal(12);
  pageIndex = signal(0);
  
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.festivalService.getAllGames().subscribe({
      next: (games) => {
        this.allGames.set(games);
        this.extractGameTypes(games);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading games:', err);
        this.error.set('Failed to load games. Please try again later.');
        this.allGames.set([]);
        this.isLoading.set(false);
      }
    });
  }

  extractGameTypes(games: GameDisplay[]): void {
    const types = new Map<number, string>();
    games.forEach(game => {
      if (game.typeJeu?.id && game.typeJeu?.libelle) {
        types.set(game.typeJeu.id, game.typeJeu.libelle);
      }
    });
    this.gameTypes.set(Array.from(types, ([id, libelle]) => ({ id, libelle })));
  }

  applyFilters(): void {
    let filtered = this.allGames();

    // Filter by search term (name, author, theme)
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(game => 
        game.libelle.toLowerCase().includes(term) ||
        game.auteur?.toLowerCase().includes(term) ||
        game.theme?.toLowerCase().includes(term) ||
        game.description?.toLowerCase().includes(term)
      );
    }

    // Filter by game type
    if (this.selectedGameType()) {
      filtered = filtered.filter(game => game.typeJeu?.id === this.selectedGameType());
    }

    this.filteredGames.set(filtered);
    this.updatePaginatedGames();
  }

  updatePaginatedGames(): void {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    this.paginatedGames.set(this.filteredGames().slice(start, end));
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.updatePaginatedGames();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  onTypeChange(typeId: number | null): void {
    this.selectedGameType.set(typeId);
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedGameType.set(null);
    this.pageIndex.set(0);
    this.applyFilters();
  }
}
