import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { FestivalService } from '../../core/services/festival.service';
import { FestivalSelectionService } from '../../core/services/festival-selection.service';
import { Festival, ZoneTarifaire, ZonePlan } from '../../core/models/festival';

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
  selector: 'app-public-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    DatePipe,
    RouterModule
  ],
  templateUrl: './public-view.component.html',
  styleUrls: ['./public-view.component.css']
})
export class PublicViewComponent implements OnInit {
  private festivalService = inject(FestivalService);
  private festivalSelectionService = inject(FestivalSelectionService);

  festivals = signal<Festival[]>([]);
  lastFestival = signal<Festival | null>(null);
  selectedFestival = signal<Festival | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  zoneTarifaires = signal<ZoneTarifaire[]>([]);
  zonePlans = signal<ZonePlan[]>([]);
  allGames = signal<GameDisplay[]>([]);
  filteredGames = signal<GameDisplay[]>([]);
  gameTypes = signal<any[]>([]);
  
  // Search and filter
  searchTerm = signal<string>('');
  selectedGameType = signal<number | null>(null);
  
  // Maps to store games by zone
  gamesByZoneTarifaire = signal<Map<number, GameDisplay[]>>(new Map());
  gamesByZonePlan = signal<Map<number, GameDisplay[]>>(new Map());

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
    
    if (festival.id) {
      this.loadFestivalDetails(festival.id);
    }
  }

  loadFestivalDetails(festivalId: number): void {
    this.festivalService.getFestivalById(festivalId).subscribe({
      next: (festival) => {
        if (festival.zoneTarifaires) {
          this.zoneTarifaires.set(festival.zoneTarifaires);
        }
        if (festival.zonePlans) {
          this.zonePlans.set(festival.zonePlans);
        }
        
        // Load all games for this festival
        this.loadAllGames();
      },
      error: (err) => {
        console.error('Error loading festival details:', err);
      }
    });
  }

  loadAllGames(): void {
    this.festivalService.getAllGames().subscribe({
      next: (games) => {
        this.allGames.set(games);
        this.extractGameTypes(games);
        this.applyFilters();
        this.loadGamesForZones();
      },
      error: (err) => {
        console.error('Error loading games:', err);
        this.allGames.set([]);
      }
    });
  }

  loadGamesForZones(): void {
    // For zone tarifaires, only use games that are assigned via reservations
    const zoneTarMap = new Map<number, GameDisplay[]>();
    this.zoneTarifaires().forEach(zone => {
      this.festivalService.getGamesByZoneTarifaire(zone.id).subscribe({
        next: (games) => {
          zoneTarMap.set(zone.id, games);
          this.gamesByZoneTarifaire.set(new Map(zoneTarMap));
        },
        error: () => {
          zoneTarMap.set(zone.id, []);
          this.gamesByZoneTarifaire.set(new Map(zoneTarMap));
        }
      });
    });

    // For zone plans, only use games that are assigned via reservations
    const zonePlanMap = new Map<number, GameDisplay[]>();
    this.zonePlans().forEach(zone => {
      this.festivalService.getGamesByZonePlan(zone.id).subscribe({
        next: (games) => {
          zonePlanMap.set(zone.id, games);
          this.gamesByZonePlan.set(new Map(zonePlanMap));
        },
        error: () => {
          zonePlanMap.set(zone.id, []);
          this.gamesByZonePlan.set(new Map(zonePlanMap));
        }
      });
    });
  }

  getGamesForZoneTarifaire(zoneId: number): GameDisplay[] {
    return this.gamesByZoneTarifaire().get(zoneId) || [];
  }

  getGamesForZonePlan(zoneId: number): GameDisplay[] {
    return this.gamesByZonePlan().get(zoneId) || [];
  }

  isFestivalSelected(festival: Festival): boolean {
    return this.selectedFestival()?.id === festival.id;
  }

  isLatestFestival(festival: Festival): boolean {
    return this.lastFestival()?.id === festival.id;
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
    this.applyFilters();
  }
}
